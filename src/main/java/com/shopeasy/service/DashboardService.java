package com.shopeasy.service;

import com.shopeasy.dto.DashboardStatsDTO;
import com.shopeasy.dto.OrderDTO;
import com.shopeasy.dto.ProductDTO;
import com.shopeasy.entity.OrderStatus;
import com.shopeasy.entity.Role;
import com.shopeasy.repository.OrderRepository;
import com.shopeasy.repository.ProductRepository;
import com.shopeasy.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DashboardService(ProductRepository productRepository,
                            OrderRepository orderRepository,
                            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));

        BigDecimal totalSales = orderRepository.calculateTotalSales();
        stats.setTotalSales(totalSales != null ? totalSales : BigDecimal.ZERO);

        stats.setPlacedOrders(orderRepository.countByStatus(OrderStatus.PLACED));
        stats.setDeliveredOrders(orderRepository.countByStatus(OrderStatus.DELIVERED));

        List<OrderDTO> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(6)
                .map(OrderDTO::new)
                .collect(Collectors.toList());
        stats.setRecentOrders(recentOrders);

        List<ProductDTO> lowStockProducts = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() <= 5)
                .map(ProductDTO::new)
                .collect(Collectors.toList());
        stats.setLowStockProducts(lowStockProducts);

        return stats;
    }
}
