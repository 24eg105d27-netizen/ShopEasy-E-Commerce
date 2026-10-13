package com.shopeasy.dto;

import com.shopeasy.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public OrderItemDTO() {
    }

    public OrderItemDTO(OrderItem item) {
        if (item != null) {
            this.id = item.getId();
            if (item.getProduct() != null) {
                this.productId = item.getProduct().getId();
                this.productImageUrl = item.getProduct().getImageUrl();
            }
            this.productName = item.getProductName();
            this.quantity = item.getQuantity();
            this.unitPrice = item.getUnitPrice();
            this.subtotal = item.getSubtotal();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
