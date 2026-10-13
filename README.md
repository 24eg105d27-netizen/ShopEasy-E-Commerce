# ShopEasy — Java Full Stack E-Commerce Website

**ShopEasy** is a complete, production-grade, intermediate-level college project designed and built as a full-stack e-commerce web application.

---

## 1. Technology Stack

### Frontend
- **HTML5 & CSS3**: Semantic markups, custom CSS variables, and modern glassmorphism aesthetic.
- **JavaScript (ES6+)**: Fetch API, token management, dynamic DOM rendering, and responsive interactivity.
- **Bootstrap 5.3 & Bootstrap Icons**: Responsive mobile-first grid, accessible UI components, modals, and navigation.

### Backend
- **Java 21 (LTS)**: Utilizing modern Java features.
- **Spring Boot 3.3.4**: High-performance backend engine.
- **Spring Web & REST APIs**: Layered architecture (Controllers, Services, Repositories, DTOs, Entities).
- **Spring Data JPA & Hibernate**: Object-relational mapping, custom JPQL queries, and database relationships.
- **Spring Security 6 & JJWT**: Stateless token-based security, BCrypt password hashing, and role-based authorization (`ROLE_CUSTOMER`, `ROLE_ADMIN`).
- **Apache Maven**: Dependency management and build lifecycle.

### Database
- **MySQL 8.0**: Relational database schema with foreign keys, transactional integrity, and historical unit price preservation.

---

## 2. Key Features

### Customer Website
1. **Home Page (`index.html`)**:
   - Sticky navigation with search bar and live cart badge counter.
   - Promotional festive banner with hero CTA.
   - Interactive category cards with product count.
   - Trending and featured product showcase.
   - Feature guarantee cards (Free Delivery, Secure Checkout, Easy Returns, 24/7 Support).
2. **Product Catalog (`products.html`)**:
   - Real-time keyword search across names and descriptions.
   - Filter by categories and price brackets.
   - Sort by Newest, Price (Low to High, High to Low), and Name (A–Z).
   - Instant "Add to Cart" and stock badge indicators.
3. **Product Details (`product-details.html`)**:
   - Breadcrumb navigation, responsive high-res images, and stock availability badge.
   - Quantity stepper with stock upper bound validation.
   - "Add to Cart" and instantaneous "Buy Now" flow.
   - Detailed product descriptions and related items carousel.
4. **Shopping Cart (`cart.html`)**:
   - Real-time quantity adjustments and item deletion.
   - Promo coupon discounts (`WELCOME10` or `SHOPEASY20`).
   - Dynamic server-calculated subtotal, GST (5%), and free delivery threshold.
   - Empty cart state with interactive CTA.
5. **Checkout Page (`checkout.html`)**:
   - Automatic pre-fill of logged-in customer credentials.
   - Full delivery address form validation.
   - Payment method selection: Cash on Delivery (COD), Demo UPI / QR Code, Demo Credit/Debit Card.
   - Server-side database price recalculation and atomic stock deduction within `@Transactional` boundary.
6. **Order Confirmation (`order-confirmation.html`)**:
   - Order tracking receipt with unique reference code (`ORD-YYYYMMDD-XXXX`).
   - Itemized purchase breakdown with locked prices at time of purchase.
7. **Customer Dashboard (`dashboard.html`)**:
   - Customer profile overview.
   - Order history with status progression timeline (Placed &rarr; Processing &rarr; Shipped &rarr; Delivered &rarr; Cancelled).
   - Order cancellation capability for pending orders with automatic stock replenishment.
8. **Authentication (`login.html` & `register.html`)**:
   - BCrypt hashed password encryption.
   - 1-click **"Demo Customer"** and **"Demo Admin"** credentials quick-fill buttons for instant grading and evaluation.

### Admin Dashboard (`admin.html`)
- Protected via `ROLE_ADMIN` authentication.
- Live statistical metric cards:
  - Total Revenue (₹)
  - Total Orders Placed
  - Active Products in Inventory
  - Total Registered Customers
- **Product Management**:
  - Add, View, Edit, and Delete products with modal dialogs.
  - Image URL, Category, Price, and Stock level controls.
  - Automatic low-stock warnings when inventory is 5 or below.
- **Order Management**:
  - Filter by order status and search by Order # or Customer.
  - Real-time status updater dropdown (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - View full order details modal.
- **Customer Accounts Directory**:
  - View registered user details and registration timestamps.

---

## 3. Project Directory Structure

```
ShopEasy/
├── pom.xml                               # Maven project dependencies & build plugins
├── README.md                             # Comprehensive project documentation
├── build.bat                             # Windows compilation script
├── run.bat                               # Windows one-click start script
├── database/
│   └── schema.sql                        # Complete MySQL DDL & DML seed script
└── src/
    └── main/
        ├── java/
        │   └── com/shopeasy/
        │       ├── ShopEasyApplication.java
        │       ├── config/               # DataInitializer & WebMvc routing
        │       ├── controller/           # REST API endpoints
        │       ├── dto/                  # Data Transfer Objects
        │       ├── entity/               # JPA Hibernate entity models
        │       ├── exception/            # Global exception handlers
        │       ├── repository/           # Spring Data JPA repositories
        │       ├── security/             # SecurityConfig, JWT filters & handlers
        │       └── service/              # Core business logic & transactions
        └── resources/
            ├── application.properties    # MySQL connection & JWT settings
            └── static/                   # Frontend assets
                ├── index.html            # Home page
                ├── products.html         # Product catalog
                ├── product-details.html  # Single product details
                ├── cart.html             # Shopping cart
                ├── checkout.html         # Checkout page
                ├── order-confirmation.html # Order receipt
                ├── login.html            # User & admin login
                ├── register.html         # User registration
                ├── dashboard.html        # Customer orders dashboard
                ├── admin.html            # Admin management console
                ├── css/
                │   └── styles.css        # Premium custom stylesheet
                └── js/
                    ├── api.js            # Central API caller & notifications
                    ├── auth.js           # Auth & demo quick-fill logic
                    ├── main.js           # Home page rendering
                    ├── products.js       # Search & filter controllers
                    ├── product-details.js # Single product details controller
                    ├── cart.js           # Shopping cart manager
                    ├── checkout.js       # Checkout validation
                    ├── dashboard.js      # Customer dashboard controller
                    └── admin.js          # Admin dashboard & CRUD operations
```

---

## 4. Database Setup & Configuration

### Prerequisites
- MySQL Server 8.0 running on `localhost:3306`.
- Root or designated database user.

### Option A: Automatic Setup (Recommended)
On application startup, Hibernate (`spring.jpa.hibernate.ddl-auto=update`) and `DataInitializer.java` automatically create all tables, categories, sample products, demo users, and seed orders if they do not exist.

### Option B: Manual Setup via `schema.sql`
Run the provided SQL script using MySQL Command Line Client or MySQL Workbench:
```sql
mysql -u root -p < database/schema.sql
```

### Configuring MySQL Credentials
Open `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:shopeasy_db}?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:123456}
```
You can also override credentials using Windows Environment Variables:
```cmd
set DB_USERNAME=root
set DB_PASSWORD=your_password
```

---

## 5. How to Run on Windows

### Method 1: Using the Included Batch Script (Easiest)
Simply double-click or run:
```cmd
run.bat
```
*(This sets JAVA_HOME, resolves the local Maven path, and launches `mvn spring-boot:run`)*

### Method 2: Using Maven Command Line
```cmd
mvn clean spring-boot:run
```

Once started, open your web browser and navigate to:
```
http://localhost:8080
```

---

## 6. Default Demo Credentials

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@shopeasy.com` | `admin123` | Full Admin Console, Metrics, Product CRUD, Order Status |
| **Customer** | `customer@shopeasy.com` | `customer123` | Browsing, Cart, Checkout, Order Tracking, Dashboard |

*(Tip: Both login forms feature 1-click "Demo Admin" and "Demo Customer" autofill buttons!)*

---

## 7. REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer account.
- `POST /api/auth/login` — Sign in and obtain a JWT bearer token.
- `GET /api/auth/me` — Retrieve the currently authenticated user's profile.

### Catalog (`/api/products` & `/api/categories`)
- `GET /api/categories` — Fetch all product categories.
- `GET /api/products` — Filter and search products (params: `categoryId`, `keyword`, `minPrice`, `maxPrice`, `sortBy`).
- `GET /api/products/featured` — Fetch featured trending products.
- `GET /api/products/{id}` — Fetch details for a single product.

### Shopping Cart (`/api/cart`) [Requires Bearer Token]
- `GET /api/cart` — Fetch user's cart with subtotal, tax, and delivery charges.
- `POST /api/cart/add` — Add an item to the cart (validates against stock).
- `PUT /api/cart/items/{id}` — Update item quantity.
- `DELETE /api/cart/items/{id}` — Remove item from cart.
- `DELETE /api/cart/clear` — Empty the entire cart.

### Orders (`/api/orders`) [Requires Bearer Token]
- `POST /api/orders/checkout` — Place an order (atomic transaction, server-calculated totals, stock deduction).
- `GET /api/orders/my-orders` — View logged-in customer's order history.
- `GET /api/orders/{orderNumber}` — View specific order details.
- `POST /api/orders/{orderId}/cancel` — Cancel an order (restores product inventory).

### Admin Portal (`/api/admin`) [Requires `ROLE_ADMIN`]
- `GET /api/admin/stats` — Overall statistics: total sales, orders, products, customers, low stock.
- `GET /api/admin/products` — Retrieve products for admin management.
- `POST /api/products` — Create a new product.
- `PUT /api/products/{id}` — Update an existing product.
- `DELETE /api/products/{id}` — Delete a product.
- `GET /api/admin/orders` — Search and filter all customer orders.
- `PATCH /api/admin/orders/{id}/status` — Update order status.
- `GET /api/admin/customers` — List all registered customer accounts.

---

## 8. Verification & Test Workflow

1. **Catalog Browsing**: Open `http://localhost:8080`, view featured products, click categories to filter.
2. **Product Details**: Click on a product card, test the quantity stepper, and click "Add to Cart".
3. **Cart & Promo Code**: Navigate to `cart.html`, test quantity +/- controls, apply promo code `WELCOME10` to get 10% off.
4. **Checkout**: Proceed to `checkout.html`, enter shipping address, choose "Cash on Delivery", and submit order.
5. **Confirmation & Receipt**: View `order-confirmation.html` showing receipt and unique order number.
6. **Dashboard**: Navigate to `dashboard.html` to see the newly placed order with its tracking timeline.
7. **Admin Operations**: Log in with `admin@shopeasy.com` / `admin123`, navigate to `admin.html`, edit a product's price/stock, add a new product, and update an order's status to `Shipped` or `Delivered`.
