package com.shopeasy.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class CartResponseDTO {
    private List<CartItemDTO> items = new ArrayList<>();
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal shippingFee = BigDecimal.ZERO;
    private BigDecimal tax = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;
    private int totalItems = 0;

    public CartResponseDTO() {
    }

    public CartResponseDTO(List<CartItemDTO> items) {
        this.items = items != null ? items : new ArrayList<>();
        calculateTotals();
    }

    public void calculateTotals() {
        this.subtotal = BigDecimal.ZERO;
        this.totalItems = 0;

        for (CartItemDTO item : items) {
            if (item.getSubtotal() != null) {
                this.subtotal = this.subtotal.add(item.getSubtotal());
            }
            if (item.getQuantity() != null) {
                this.totalItems += item.getQuantity();
            }
        }

        // Free shipping if subtotal >= 999 or cart is empty
        if (this.subtotal.compareTo(BigDecimal.ZERO) > 0 && this.subtotal.compareTo(new BigDecimal("999.00")) < 0) {
            this.shippingFee = new BigDecimal("49.00");
        } else {
            this.shippingFee = BigDecimal.ZERO;
        }

        // 5% standard GST
        if (this.subtotal.compareTo(BigDecimal.ZERO) > 0) {
            this.tax = this.subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        } else {
            this.tax = BigDecimal.ZERO;
        }

        this.total = this.subtotal.add(this.shippingFee).add(this.tax);
    }

    // Getters and Setters
    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
        calculateTotals();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
}
