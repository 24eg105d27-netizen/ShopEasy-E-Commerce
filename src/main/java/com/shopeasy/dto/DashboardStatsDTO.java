package com.shopeasy.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DashboardStatsDTO {
    private long totalProducts;
    private long totalOrders;
    private long totalCustomers;
    private BigDecimal totalSales = BigDecimal.ZERO;
    private long placedOrders;
    private long deliveredOrders;
    private List<OrderDTO> recentOrders = new ArrayList<>();
    private List<ProductDTO> lowStockProducts = new ArrayList<>();

    public DashboardStatsDTO() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public long getPlacedOrders() {
        return placedOrders;
    }

    public void setPlacedOrders(long placedOrders) {
        this.placedOrders = placedOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public List<OrderDTO> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<OrderDTO> recentOrders) {
        this.recentOrders = recentOrders;
    }

    public List<ProductDTO> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<ProductDTO> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
}
