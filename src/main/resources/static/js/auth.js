/**
 * ShopEasy - Authentication & Registration Handler
 */

function fillDemoCustomer() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput && passInput) {
        emailInput.value = 'customer@shopeasy.com';
        passInput.value = 'customer123';
        showToast('Demo Customer credentials loaded!', 'info');
    }
}

function fillDemoAdmin() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (emailInput && passInput) {
        emailInput.value = 'admin@shopeasy.com';
        passInput.value = 'admin123';
        showToast('Demo Admin credentials loaded!', 'info');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const originalText = btn.innerHTML;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Please enter both email and password', 'warning');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Signing In...`;

        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        if (res && res.success && res.data) {
            Storage.setToken(res.data.token);
            Storage.setUser(res.data.user);
            showToast('Welcome back, ' + res.data.user.name + '!', 'success');

            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');

            setTimeout(() => {
                if (redirect) {
                    window.location.href = redirect;
                } else if (res.data.user.role === 'ROLE_ADMIN') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 800);
        } else {
            showToast(res.message || 'Login failed', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    const originalText = btn.innerHTML;

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!name || !email || !password) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...`;

        const res = await apiFetch('/auth/register', {
            method: 'POST',
            body: { name, email, phone, password }
        });

        if (res && res.success && res.data) {
            Storage.setToken(res.data.token);
            Storage.setUser(res.data.user);
            showToast('Account created successfully! Welcome to ShopEasy.', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast(res.message || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Registration failed. Email might already exist.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
