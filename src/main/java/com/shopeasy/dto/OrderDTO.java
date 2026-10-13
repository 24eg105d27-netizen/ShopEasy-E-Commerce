package com.shopeasy.dto;

import com.shopeasy.entity.Order;
import com.shopeasy.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items = new ArrayList<>();
    private int itemsCount;

    public OrderDTO() {
    }

    public OrderDTO(Order order) {
        if (order != null) {
            this.id = order.getId();
            this.orderNumber = order.getOrderNumber();
            if (order.getUser() != null) {
                this.userId = order.getUser().getId();
            }
            this.customerName = order.getCustomerName();
            this.customerEmail = order.getCustomerEmail();
            this.customerPhone = order.getCustomerPhone();
            this.shippingAddress = order.getShippingAddress();
            this.totalAmount = order.getTotalAmount();
            this.status = order.getStatus();
            this.paymentMethod = order.getPaymentMethod();
            this.createdAt = order.getCreatedAt();
            if (order.getOrderItems() != null) {
                this.items = order.getOrderItems().stream()
                        .map(OrderItemDTO::new)
                        .collect(Collectors.toList());
                this.itemsCount = this.items.stream().mapToInt(OrderItemDTO::getQuantity).sum();
            }
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public int getItemsCount() {
        return itemsCount;
    }

    public void setItemsCount(int itemsCount) {
        this.itemsCount = itemsCount;
    }
}
