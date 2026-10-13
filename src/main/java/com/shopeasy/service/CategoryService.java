package com.shopeasy.service;

import com.shopeasy.dto.CategoryDTO;
import com.shopeasy.entity.Category;
import com.shopeasy.exception.BadRequestException;
import com.shopeasy.exception.ResourceNotFoundException;
import com.shopeasy.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return new CategoryDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Category with this name already exists");
        }
        Category category = new Category(dto.getName().trim(), dto.getDescription(), dto.getImageUrl());
        Category saved = categoryRepository.save(category);
        return new CategoryDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!category.getName().equalsIgnoreCase(dto.getName()) && categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Another category with this name already exists");
        }

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());

        return new CategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
