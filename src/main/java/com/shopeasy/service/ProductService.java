package com.shopeasy.service;

import com.shopeasy.dto.ProductDTO;
import com.shopeasy.entity.Category;
import com.shopeasy.entity.Product;
import com.shopeasy.exception.ResourceNotFoundException;
import com.shopeasy.repository.CategoryRepository;
import com.shopeasy.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getFeaturedProducts() {
        return productRepository.findTop8ByOrderByCreatedAtDesc().stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchAndFilter(Long categoryId, String keyword, BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
        String queryKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        List<Product> products = productRepository.searchProducts(categoryId, queryKeyword, minPrice, maxPrice);

        List<ProductDTO> dtoList = products.stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());

        if ("price_asc".equalsIgnoreCase(sortBy)) {
            dtoList.sort(Comparator.comparing(ProductDTO::getPrice));
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            dtoList.sort(Comparator.comparing(ProductDTO::getPrice).reversed());
        } else if ("name_asc".equalsIgnoreCase(sortBy)) {
            dtoList.sort(Comparator.comparing(ProductDTO::getName, String.CASE_INSENSITIVE_ORDER));
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            dtoList.sort((p1, p2) -> {
                if (p1.getCreatedAt() == null || p2.getCreatedAt() == null) return 0;
                return p2.getCreatedAt().compareTo(p1.getCreatedAt());
            });
        }

        return dtoList;
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return new ProductDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));
        }

        Product product = new Product(
                dto.getName().trim(),
                dto.getDescription(),
                dto.getPrice(),
                dto.getStockQuantity(),
                dto.getImageUrl(),
                category
        );

        Product saved = productRepository.save(product);
        return new ProductDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));
        }

        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);

        Product updated = productRepository.save(product);
        return new ProductDTO(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }
}
