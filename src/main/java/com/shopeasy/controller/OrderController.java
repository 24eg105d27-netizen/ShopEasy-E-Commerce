package com.shopeasy.controller;

import com.shopeasy.dto.ApiResponse;
import com.shopeasy.dto.CheckoutRequest;
import com.shopeasy.dto.OrderDTO;
import com.shopeasy.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDTO>> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequest request
    ) {
        OrderDTO order = orderService.placeOrder(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully!", order));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getMyOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.getUserOrders(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderByNumber(
            Authentication authentication,
            @PathVariable String orderNumber
    ) {
        OrderDTO order = orderService.getOrderByNumber(authentication.getName(), orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved", order));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        OrderDTO order = orderService.cancelOrder(authentication.getName(), orderId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
}
