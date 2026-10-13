package com.shopeasy.config;

import com.shopeasy.entity.*;
import com.shopeasy.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           OrderRepository orderRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Checking ShopEasy database initialization...");

        // 1. Seed Users if not present
        User admin = userRepository.findByEmail("admin@shopeasy.com").orElse(null);
        if (admin == null) {
            admin = new User(
                    "ShopEasy Admin",
                    "admin@shopeasy.com",
                    passwordEncoder.encode("admin123"),
                    "+91 9876543210",
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            logger.info("Created default Admin: admin@shopeasy.com / admin123");
        }

        User customer = userRepository.findByEmail("customer@shopeasy.com").orElse(null);
        if (customer == null) {
            customer = new User(
                    "Rahul Sharma",
                    "customer@shopeasy.com",
                    passwordEncoder.encode("customer123"),
                    "+91 9876543211",
                    Role.ROLE_CUSTOMER
            );
            userRepository.save(customer);
            logger.info("Created default Customer: customer@shopeasy.com / customer123");
        }

        // 2. Seed Categories if empty
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                    new Category("Electronics", "Smartphones, premium headphones, laptops, and smart wearable accessories", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80"),
                    new Category("Fashion", "Contemporary men and women clothing, apparel, and lifestyle wear", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80"),
                    new Category("Home & Kitchen", "Modern kitchen gadgets, cookware, and cozy home decor essentials", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80"),
                    new Category("Footwear", "High-performance running shoes, sneakers, and casual comfort footwear", "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80"),
                    new Category("Books & Stationery", "Bestselling self-growth literature, desk notebooks, and premium pens", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80")
            );
            categoryRepository.saveAll(categories);
            logger.info("Seeded 5 categories");
        }

        // 3. Seed Products if empty
        if (productRepository.count() == 0) {
            Category electronics = categoryRepository.findByNameIgnoreCase("Electronics").orElse(null);
            Category fashion = categoryRepository.findByNameIgnoreCase("Fashion").orElse(null);
            Category home = categoryRepository.findByNameIgnoreCase("Home & Kitchen").orElse(null);
            Category footwear = categoryRepository.findByNameIgnoreCase("Footwear").orElse(null);
            Category books = categoryRepository.findByNameIgnoreCase("Books & Stationery").orElse(null);

            List<Product> products = new ArrayList<>();

            // Electronics
            products.add(new Product(
                    "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
                    "Industry-leading active noise cancellation with 8 microphones, Auto NC Optimizer, 30 hours battery life, and crystal-clear hands-free calling.",
                    new BigDecimal("24999.00"), 25,
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", electronics
            ));
            products.add(new Product(
                    "Apple Watch Series 9 GPS 45mm",
                    "Brilliant Always-On Retina OLED display, S9 SiP chip with Double Tap gesture, blood oxygen sensor, and advanced fitness tracking.",
                    new BigDecimal("34900.00"), 18,
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", electronics
            ));
            products.add(new Product(
                    "Logitech MX Master 3S Wireless Mouse",
                    "Ergonomic quiet click mouse with 8,000 DPI sensor on glass, MagSpeed electromagnetic scroll wheel, and Bluetooth Multi-Device connectivity.",
                    new BigDecimal("8495.00"), 35,
                    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80", electronics
            ));
            products.add(new Product(
                    "Bose SoundLink Flex Bluetooth Speaker",
                    "State-of-the-art portable outdoor speaker engineered for deep, rich audio with PositionIQ technology, IP67 waterproof & dustproof rating.",
                    new BigDecimal("12900.00"), 20,
                    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80", electronics
            ));

            // Fashion
            products.add(new Product(
                    "Men Classic Slim-Fit Oxford Cotton Shirt",
                    "100% long-staple Egyptian cotton shirt tailored with button-down collar and breathable weave for effortless formal and weekend style.",
                    new BigDecimal("1499.00"), 50,
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", fashion
            ));
            products.add(new Product(
                    "Women Bohemian Floral Wrap Midi Dress",
                    "Vibrant printed wrap dress crafted from premium airy viscose with flattering tie-waist detail and flowy flared hemline.",
                    new BigDecimal("2299.00"), 30,
                    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", fashion
            ));
            products.add(new Product(
                    "Unisex Polarized Classic Aviator Sunglasses",
                    "UV400 scratch-resistant polarized lenses with lightweight durable metallic alloy frame and soft silicone nose pads.",
                    new BigDecimal("1199.00"), 45,
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80", fashion
            ));

            // Footwear
            products.add(new Product(
                    "Nike Air Zoom Pegasus 40 Running Shoes",
                    "Responsive everyday workhorse running shoes with dual Zoom Air units, engineered sandwich mesh upper, and waffle-inspired traction.",
                    new BigDecimal("8295.00"), 22,
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", footwear
            ));
            products.add(new Product(
                    "Puma Smash V2 Leather Sneakers",
                    "Iconic court-inspired low-boot silhouette with soft premium leather upper, clean white midsole, and cushioned SoftFoam+ sockliner.",
                    new BigDecimal("2799.00"), 40,
                    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80", footwear
            ));

            // Home & Kitchen
            products.add(new Product(
                    "Stainless Steel Insulated French Press Coffee Maker",
                    "Double-wall vacuum insulated body keeps coffee hot for 3 hours, 4-stage stainless mesh filtration system, 1000ml capacity.",
                    new BigDecimal("1899.00"), 35,
                    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80", home
            ));
            products.add(new Product(
                    "Minimalist Ceramic Touch Desk Lamp",
                    "Scandinavian inspired matte ceramic lamp with 3-level warm ambient dimmable LED lighting and tactile brass touch switch.",
                    new BigDecimal("2499.00"), 12,
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", home
            ));

            // Books
            products.add(new Product(
                    "Atomic Habits by James Clear",
                    "Transformative worldwide bestseller detailing actionable frameworks to make small 1% improvements every day and break undesirable patterns.",
                    new BigDecimal("499.00"), 80,
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80", books
            ));

            productRepository.saveAll(products);
            logger.info("Seeded 12 products across 5 categories");
        }

        // 4. Seed Initial Orders if empty
        if (orderRepository.count() == 0 && customer != null) {
            Product headphone = productRepository.findAll().stream()
                    .filter(p -> p.getName().contains("Headphones"))
                    .findFirst().orElse(null);
            Product book = productRepository.findAll().stream()
                    .filter(p -> p.getName().contains("Atomic Habits"))
                    .findFirst().orElse(null);

            if (headphone != null && book != null) {
                Order order1 = new Order(
                        "ORD-20261010-91A2",
                        customer,
                        customer.getName(),
                        customer.getEmail(),
                        customer.getPhone(),
                        "Flat 402, Green Glen Heights, Outer Ring Road, Bangalore, Karnataka - 560103",
                        new BigDecimal("25498.00"),
                        OrderStatus.DELIVERED,
                        "Demo UPI"
                );

                OrderItem item1 = new OrderItem(order1, headphone, headphone.getName(), 1, headphone.getPrice(), headphone.getPrice());
                OrderItem item2 = new OrderItem(order1, book, book.getName(), 1, book.getPrice(), book.getPrice());
                order1.addOrderItem(item1);
                order1.addOrderItem(item2);

                orderRepository.save(order1);
                logger.info("Seeded initial demo order for dashboard analytics");
            }
        }

        logger.info("ShopEasy database initialization complete.");
    }
}
