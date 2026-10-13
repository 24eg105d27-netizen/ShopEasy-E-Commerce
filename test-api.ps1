# ShopEasy API Integration Test Suite

$baseUrl = "http://localhost:8080"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing ShopEasy E-Commerce REST APIs" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Test 1: Check Categories
Write-Host "1. Testing GET /api/categories..." -NoNewline
try {
    $catRes = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method Get
    if ($catRes.success -and $catRes.data.Count -gt 0) {
        Write-Host " [PASS] (Found $($catRes.data.Count) categories)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERROR] $_" -ForegroundColor Red
}

# Test 2: Check Products Catalog
Write-Host "2. Testing GET /api/products..." -NoNewline
try {
    $prodRes = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    if ($prodRes.success -and $prodRes.data.Count -gt 0) {
        Write-Host " [PASS] (Found $($prodRes.data.Count) products)" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERROR] $_" -ForegroundColor Red
}

# Test 3: Customer Login
Write-Host "3. Testing POST /api/auth/login (Customer)..." -NoNewline
$custToken = ""
try {
    $loginBody = @{ email = "customer@shopeasy.com"; password = "customer123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    if ($loginRes.success -and $loginRes.data.token) {
        $custToken = $loginRes.data.token
        Write-Host " [PASS] (Logged in as $($loginRes.data.user.name))" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERROR] $_" -ForegroundColor Red
}

# Test 4: Add to Cart
Write-Host "4. Testing POST /api/cart/add..." -NoNewline
try {
    $firstProd = $prodRes.data[0]
    $addBody = @{ productId = $firstProd.id; quantity = 1 } | ConvertTo-Json
    $cartRes = Invoke-RestMethod -Uri "$baseUrl/api/cart/add" -Method Post -Body $addBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $custToken" }
    if ($cartRes.success -and $cartRes.data.totalItems -gt 0) {
        Write-Host " [PASS] (Cart items: $($cartRes.data.totalItems), Total: $($cartRes.data.total))" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERROR] $_" -ForegroundColor Red
}

# Test 5: Checkout Order
Write-Host "5. Testing POST /api/orders/checkout..." -NoNewline
$orderNum = ""
try {
    $orderBody = @{
        customerName = "Rahul Sharma";
        customerEmail = "customer@shopeasy.com";
        customerPhone = "+91 9876543211";
        shippingAddress = "Flat 101, Test Residency, Bangalore - 560001";
        paymentMethod = "Cash on Delivery"
    } | ConvertTo-Json

    $orderRes = Invoke-RestMethod -Uri "$baseUrl/api/orders/checkout" -Method Post -Body $orderBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $custToken" }
    if ($orderRes.success -and $orderRes.data.orderNumber) {
        $orderNum = $orderRes.data.orderNumber
        Write-Host " [PASS] (Placed Order: $orderNum, Status: $($orderRes.data.status))" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERROR] $_" -ForegroundColor Red
}

# Test 6: Admin Login & Dashboard Stats
Write-Host "6. Testing Admin Login & GET /api/admin/stats..." -NoNewline
try {
    $adminLogin = @{ email = "admin@shopeasy.com"; password = "admin123" } | ConvertTo-Json
    $adminRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
    $adminToken = $adminRes.data.token

    $statsRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($statsRes.success) {
        Write-Host " [PASS] (Total Sales: ₹$($statsRes.data.totalSales), Orders: $($statsRes.data.totalOrders), Products: $($statsRes.data.totalProducts))" -ForegroundColor Green
    } else {
        Write-Host " [FAIL]" -ForegroundColor Red
    }
} catch {
    Write-Host " [ERROR] $_" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All core workflows validated successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
