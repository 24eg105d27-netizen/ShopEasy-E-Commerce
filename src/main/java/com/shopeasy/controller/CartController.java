package com.shopeasy.controller;

import com.shopeasy.dto.AddToCartRequest;
import com.shopeasy.dto.ApiResponse;
import com.shopeasy.dto.CartResponseDTO;
import com.shopeasy.dto.UpdateCartRequest;
import com.shopeasy.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponseDTO>> getCart(Authentication authentication) {
        CartResponseDTO cart = cartService.getCart(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponseDTO>> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartResponseDTO cart = cartService.addToCart(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartResponseDTO>> updateQuantity(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartRequest request
    ) {
        CartResponseDTO cart = cartService.updateCartItem(authentication.getName(), id, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cart));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartResponseDTO>> removeItem(
            Authentication authentication,
            @PathVariable Long id
    ) {
        CartResponseDTO cart = cartService.removeCartItem(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}
