package com.shopeasy.controller;

import com.shopeasy.dto.*;
import com.shopeasy.entity.OrderStatus;
import com.shopeasy.entity.Role;
import com.shopeasy.repository.UserRepository;
import com.shopeasy.service.DashboardService;
import com.shopeasy.service.OrderService;
import com.shopeasy.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final DashboardService dashboardService;
    private final OrderService orderService;
    private final ProductService productService;
    private final UserRepository userRepository;

    public AdminController(DashboardService dashboardService,
                           OrderService orderService,
                           ProductService productService,
                           UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.orderService = orderService;
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats() {
        DashboardStatsDTO stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String keyword
    ) {
        List<OrderDTO> orders = orderService.searchOrders(status, keyword);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved", orders));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderDTO updated = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getCustomers() {
        List<UserDTO> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_CUSTOMER)
                .map(UserDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customers));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProducts() {
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
    }
}
