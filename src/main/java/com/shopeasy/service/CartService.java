package com.shopeasy.service;

import com.shopeasy.dto.AddToCartRequest;
import com.shopeasy.dto.CartItemDTO;
import com.shopeasy.dto.CartResponseDTO;
import com.shopeasy.entity.CartItem;
import com.shopeasy.entity.Product;
import com.shopeasy.entity.User;
import com.shopeasy.exception.BadRequestException;
import com.shopeasy.exception.ResourceNotFoundException;
import com.shopeasy.repository.CartItemRepository;
import com.shopeasy.repository.ProductRepository;
import com.shopeasy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public CartResponseDTO getCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<CartItem> items = cartItemRepository.findByUserId(user.getId());
        List<CartItemDTO> dtos = items.stream().map(CartItemDTO::new).collect(Collectors.toList());
        return new CartResponseDTO(dtos);
    }

    @Transactional
    public CartResponseDTO addToCart(String userEmail, AddToCartRequest request) {
        User user = getUserByEmail(userEmail);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + product.getStockQuantity() + " available)");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add more. Available stock is " + product.getStockQuantity());
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(user, product, request.getQuantity());
            cartItemRepository.save(newItem);
        }

        return getCart(userEmail);
    }

    @Transactional
    public CartResponseDTO updateCartItem(String userEmail, Long cartItemId, int quantity) {
        User user = getUserByEmail(userEmail);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only update items in your own cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (item.getProduct().getStockQuantity() < quantity) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + item.getProduct().getStockQuantity() + " available)");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(userEmail);
    }

    @Transactional
    public CartResponseDTO removeCartItem(String userEmail, Long cartItemId) {
        User user = getUserByEmail(userEmail);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only remove items from your own cart");
        }

        cartItemRepository.delete(item);
        return getCart(userEmail);
    }

    @Transactional
    public void clearCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        cartItemRepository.deleteByUserId(user.getId());
    }
}
