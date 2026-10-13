package com.shopeasy.service;

import com.shopeasy.dto.CheckoutRequest;
import com.shopeasy.dto.OrderDTO;
import com.shopeasy.entity.*;
import com.shopeasy.exception.BadRequestException;
import com.shopeasy.exception.ResourceNotFoundException;
import com.shopeasy.repository.CartItemRepository;
import com.shopeasy.repository.OrderItemRepository;
import com.shopeasy.repository.OrderRepository;
import com.shopeasy.repository.ProductRepository;
import com.shopeasy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "ORD-" + timestamp + "-" + randomSuffix;
    }

    @Transactional
    public OrderDTO placeOrder(String userEmail, CheckoutRequest request) {
        User user = getUserByEmail(userEmail);
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty cart");
        }

        BigDecimal itemsSubtotal = BigDecimal.ZERO;

        // Verify stock for all items first
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Product '" + product.getName() + "' does not have sufficient stock. Available: " + product.getStockQuantity());
            }
        }

        // Calculate totals using database prices
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            itemsSubtotal = itemsSubtotal.add(itemTotal);
        }

        BigDecimal shippingFee = itemsSubtotal.compareTo(new BigDecimal("999.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("49.00");
        BigDecimal tax = itemsSubtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = itemsSubtotal.add(shippingFee).add(tax);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerEmail(request.getCustomerEmail().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setShippingAddress(request.getShippingAddress().trim());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PLACED);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Cash on Delivery");

        // Deduct inventory and create order items
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Create OrderItem with unit price locked at time of purchase
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            order.addOrderItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Clear user's cart
        cartItemRepository.deleteByUserId(user.getId());

        return new OrderDTO(savedOrder);
    }

    public List<OrderDTO> getUserOrders(String userEmail) {
        User user = getUserByEmail(userEmail);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderByNumber(String userEmail, String orderNumber) {
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You do not have permission to view this order");
        }

        return new OrderDTO(order);
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> searchOrders(OrderStatus status, String keyword) {
        String query = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        return orderRepository.searchOrders(status, query).stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);

        // If order was cancelled and wasn't already cancelled, restore product stock
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        Order updated = orderRepository.save(order);
        return new OrderDTO(updated);
    }

    @Transactional
    public OrderDTO cancelOrder(String userEmail, Long orderId) {
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to cancel this order");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel order that has already been shipped or delivered");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
}
