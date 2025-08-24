// Global state management
let currentUser = null;
let cart = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Check if user is logged in
    if (apiService.isAuthenticated()) {
        try {
            currentUser = await apiService.getUserProfile();
            localStorage.setItem('pickYourPupUser', JSON.stringify(currentUser));
        } catch (error) {
            console.error('Failed to get user profile:', error);
            apiService.logout();
        }
    }
    
    // Initialize all components
    initializeNavigation();
    initializeAuth();
    initializeCart();
    initializePuppyAdoption();
    initializeProductPurchase();
    initializeAnimations();
    
    // Update UI based on user state
    updateUIForUser();
    await updateCartDisplay();
    
    // Load page-specific data
    await loadPageData();
}

async function loadPageData() {
    const currentPage = window.location.pathname;
    
    try {
        if (currentPage.includes('puppies.html') || currentPage === '/' || currentPage.includes('index.html')) {
            await loadPuppies();
        }
        
        if (currentPage.includes('food.html')) {
            await loadProducts('food');
        }
        
        if (currentPage.includes('accessories.html')) {
            await loadProducts('accessories');
        }
    } catch (error) {
        console.error('Failed to load page data:', error);
    }
}

// Authentication System
function initializeAuth() {
    // Check if we need to show login modal on page load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'required') {
        setTimeout(() => showLoginModal(), 500);
    }
}

function showLoginModal() {
    const modal = createModal(`
        <div class="auth-modal">
            <h2><i class="fas fa-user"></i> Account Access</h2>
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">Sign In</button>
                <button class="auth-tab" data-tab="register">Register</button>
            </div>
            
            <div id="login-form" class="auth-form">
                <h3>Welcome Back!</h3>
                <form onsubmit="handleLogin(event)">
                    <input type="email" placeholder="Email address" required id="login-email">
                    <input type="password" placeholder="Password" required id="login-password">
                    <button type="submit" class="btn btn-primary auth-btn">Sign In</button>
                </form>
                <p class="auth-link">Don't have an account? <a href="#" onclick="switchAuthTab('register')">Register here</a></p>
            </div>
            
            <div id="register-form" class="auth-form" style="display: none;">
                <h3>Join Pick Your Pup!</h3>
                <form onsubmit="handleRegister(event)">
                    <input type="text" placeholder="Full Name" required id="register-name">
                    <input type="email" placeholder="Email address" required id="register-email">
                    <input type="tel" placeholder="Phone Number" required id="register-phone">
                    <input type="password" placeholder="Password (min 6 characters)" required id="register-password" minlength="6">
                    <input type="password" placeholder="Confirm Password" required id="register-confirm">
                    <button type="submit" class="btn btn-primary auth-btn">Create Account</button>
                </form>
                <p class="auth-link">Already have an account? <a href="#" onclick="switchAuthTab('login')">Sign in here</a></p>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    
    // Add tab switching functionality
    const authTabs = modal.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });
}

function switchAuthTab(tabName) {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    authForms.forEach(form => {
        form.style.display = form.id === `${tabName}-form` ? 'block' : 'none';
    });
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await apiService.login({ email, password });
        currentUser = response.user;
        localStorage.setItem('pickYourPupUser', JSON.stringify(currentUser));
        showNotification(`Welcome back, ${currentUser.name}!`, 'success');
        closeModal();
        updateUIForUser();
        await updateCartDisplay();
    } catch (error) {
        showNotification(error.message || 'Login failed. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await apiService.register({ name, email, phone, password });
        currentUser = response.user;
        localStorage.setItem('pickYourPupUser', JSON.stringify(currentUser));
        showNotification(`Welcome to Pick Your Pup, ${name}!`, 'success');
        closeModal();
        updateUIForUser();
        await updateCartDisplay();
    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    cart = [];
    apiService.logout();
    updateUIForUser();
    updateCartDisplay();
    showNotification('You have been logged out successfully.', 'info');
    
    // Redirect to home if on protected pages
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
}

function updateUIForUser() {
    const userIcon = document.querySelector('.nav-icons .fa-user')?.parentElement;
    
    if (userIcon) {
        if (currentUser) {
            userIcon.innerHTML = `<i class="fas fa-user-circle"></i>`;
            userIcon.title = `Logged in as ${currentUser.name}`;
        } else {
            userIcon.innerHTML = `<i class="fas fa-user"></i>`;
            userIcon.title = 'Login / Register';
        }
    }
}

// Cart Management
function initializeCart() {
    updateCartDisplay();
    
    // Add to cart buttons for products
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            handleAddToCart(e.target);
        }
        
        if (e.target.classList.contains('qty-btn')) {
            handleQuantityChange(e.target);
        }
    });
}

function handleAddToCart(button) {
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'info');
        showLoginModal();
        return;
    }
    
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.price').textContent;
    const productBrand = productCard.querySelector('.brand')?.textContent || '';
    const quantity = parseInt(productCard.querySelector('.qty-input').value) || 1;
    
    const product = {
        id: Date.now(),
        name: productName,
        brand: productBrand,
        price: productPrice,
        quantity: quantity,
        total: parseFloat(productPrice.replace('$', '')) * quantity,
        addedAt: new Date().toISOString()
    };
    
    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.name === product.name && item.brand === product.brand);
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
        existingProduct.total = parseFloat(existingProduct.price.replace('$', '')) * existingProduct.quantity;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('pickYourPupCart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(`${productName} added to cart!`, 'success');
}

function handleQuantityChange(button) {
    const qtyInput = button.parentElement.querySelector('.qty-input');
    const currentValue = parseInt(qtyInput.value);
    
    if (button.textContent === '+') {
        qtyInput.value = currentValue + 1;
    } else if (button.textContent === '-' && currentValue > 1) {
        qtyInput.value = currentValue - 1;
    }
}

function updateCartDisplay() {
    const cartIcon = document.querySelector('.nav-icons .fa-shopping-cart')?.parentElement;
    if (!cartIcon) return;
    
    let cartCount = cartIcon.querySelector('.cart-count');
    if (!cartCount) {
        cartCount = createCartBadge();
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

function createCartBadge() {
    const cartIcon = document.querySelector('.nav-icons .fa-shopping-cart').parentElement;
    const badge = document.createElement('span');
    badge.className = 'cart-count';
    badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #E53E3E;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    `;
    cartIcon.style.position = 'relative';
    cartIcon.appendChild(badge);
    return badge;
}

function showCartModal() {
    if (!currentUser) {
        showNotification('Please login to view your cart', 'info');
        showLoginModal();
        return;
    }
    
    if (cart.length === 0) {
        const modal = createModal(`
            <div class="cart-modal">
                <h2><i class="fas fa-shopping-cart"></i> Your Cart</h2>
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <h3>Your cart is empty</h3>
                    <p>Browse our products to start shopping!</p>
                    <button class="btn btn-primary" onclick="closeModal(); window.location.href='food.html'">
                        Browse Products
                    </button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
        return;
    }
    
    const cartItems = cart.map(item => `
        <div class="cart-item">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-brand">${item.brand}</p>
                <p class="item-price">${item.price} x ${item.quantity}</p>
            </div>
            <div class="item-actions">
                <span class="item-total">$${item.total.toFixed(2)}</span>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    
    const modal = createModal(`
        <div class="cart-modal">
            <h2><i class="fas fa-shopping-cart"></i> Your Cart</h2>
            <div class="cart-items">
                ${cartItems}
            </div>
            <div class="cart-summary">
                <div class="cart-total">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
                <div class="cart-actions">
                    <button class="btn btn-secondary" onclick="clearCart()">Clear Cart</button>
                    <button class="btn btn-primary" onclick="proceedToCheckout()">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('pickYourPupCart', JSON.stringify(cart));
    updateCartDisplay();
    closeModal();
    showCartModal(); // Refresh cart modal
    showNotification('Item removed from cart', 'info');
}

function clearCart() {
    cart = [];
    localStorage.setItem('pickYourPupCart', JSON.stringify(cart));
    updateCartDisplay();
    closeModal();
    showNotification('Cart cleared', 'info');
}

function proceedToCheckout() {
    // Create order
    const order = {
        id: Date.now(),
        type: 'purchase',
        items: cart,
        total: cart.reduce((sum, item) => sum + item.total, 0),
        status: 'processing',
        orderDate: new Date().toISOString(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email
    };
    
    orderHistory.push(order);
    localStorage.setItem('pickYourPupOrders', JSON.stringify(orderHistory));
    
    // Clear cart
    cart = [];
    localStorage.setItem('pickYourPupCart', JSON.stringify(cart));
    updateCartDisplay();
    
    closeModal();
    showNotification('Order placed successfully! We will process your order soon.', 'success');
    
    // Show order confirmation
    setTimeout(() => {
        showOrderConfirmation(order);
    }, 1000);
}

// Puppy Adoption System
function initializePuppyAdoption() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-view') && !e.target.classList.contains('reserved')) {
            handlePuppyReservation(e.target);
        }
        
        if (e.target.textContent.includes('Reserve') || e.target.textContent.includes('View Details')) {
            const card = e.target.closest('.puppy-card');
            if (card && !e.target.classList.contains('reserved')) {
                showPuppyModal(card);
            }
        }
    });
}

function handlePuppyReservation(button) {
    if (!currentUser) {
        showNotification('Please login to reserve a puppy', 'info');
        showLoginModal();
        return;
    }
    
    const puppyCard = button.closest('.puppy-card');
    showPuppyModal(puppyCard);
}

function showPuppyModal(puppyCard) {
    const puppyName = puppyCard.querySelector('h3').textContent;
    const breed = puppyCard.querySelector('.breed').textContent;
    const price = puppyCard.querySelector('.price').textContent;
    const age = puppyCard.querySelector('.age').textContent;
    const rating = puppyCard.querySelector('.rating-number').textContent;
    const description = puppyCard.querySelector('.description')?.textContent || 
                      `This adorable ${breed.toLowerCase()} is looking for a loving family.`;
    
    const modal = createModal(`
        <div class="puppy-modal">
            <div class="puppy-modal-header">
                <h2>${puppyName}</h2>
                <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-number">${rating}</span>
                </div>
            </div>
            <div class="puppy-modal-body">
                <div class="puppy-modal-image">
                    <div class="image-placeholder">
                        <i class="fas fa-dog"></i>
                        <p>${puppyName}'s Gallery</p>
                    </div>
                </div>
                <div class="puppy-modal-info">
                    <p class="breed-info">${breed}</p>
                    <p class="age-info">${age}</p>
                    <p class="price-large">${price}</p>
                    
                    <h3>About ${puppyName}</h3>
                    <p>${description} ${puppyName} has been health tested, vaccinated, and is ready to bring joy to your home.</p>
                    
                    <div class="puppy-features">
                        <h4>What's Included:</h4>
                        <ul>
                            <li><i class="fas fa-check"></i> Health certificate & vaccination records</li>
                            <li><i class="fas fa-check"></i> Microchip registration</li>
                            <li><i class="fas fa-check"></i> Starter kit (food, toys, blanket)</li>
                            <li><i class="fas fa-check"></i> 30-day health guarantee</li>
                            <li><i class="fas fa-check"></i> Lifetime breeder support</li>
                        </ul>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="adoptPuppy('${puppyName}', '${breed}', '${price}')">
                            <i class="fas fa-heart"></i> Adopt ${puppyName}
                        </button>
                        <button class="btn btn-secondary" onclick="contactBreeder('${puppyName}')">
                            <i class="fas fa-phone"></i> Contact Breeder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function adoptPuppy(puppyName, breed, price) {
    if (!currentUser) {
        showNotification('Please login to adopt a puppy', 'info');
        closeModal();
        showLoginModal();
        return;
    }
    
    // Create adoption order
    const adoption = {
        id: Date.now(),
        type: 'adoption',
        puppyName: puppyName,
        breed: breed,
        price: price,
        status: 'process_started',
        orderDate: new Date().toISOString(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        message: 'Adoption process started. We will call you soon to arrange pickup and complete the paperwork.'
    };
    
    orderHistory.push(adoption);
    localStorage.setItem('pickYourPupOrders', JSON.stringify(orderHistory));
    
    closeModal();
    showNotification(`🎉 Adoption process started for ${puppyName}! We will call you soon.`, 'success');
    
    // Show order confirmation
    setTimeout(() => {
        showAdoptionConfirmation(adoption);
    }, 1000);
}

function contactBreeder(puppyName) {
    closeModal();
    showNotification(`📞 We'll connect you with ${puppyName}'s breeder within 24 hours!`, 'info');
    
    // Redirect to contact page
    setTimeout(() => {
        window.location.href = 'contact.html';
    }, 2000);
}

// Navigation and General Functions
function initializeNavigation() {
    const navIcons = document.querySelectorAll('.nav-icons i');
    
    // Navigation icons functionality
    navIcons.forEach(icon => {
        icon.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            const iconClass = icon.className;
            
            if (iconClass.includes('search')) {
                showSearchModal();
            } else if (iconClass.includes('heart')) {
                showFavoritesModal();
            } else if (iconClass.includes('shopping-cart')) {
                showCartModal();
            } else if (iconClass.includes('user')) {
                if (currentUser) {
                    showUserAccountModal();
                } else {
                    showLoginModal();
                }
            }
        });
    });
    
    // Category tabs functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('category-tab')) {
            const tabs = document.querySelectorAll('.category-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            filterProducts(category);
        }
    });
}

function showUserAccountModal() {
    const modal = createModal(`
        <div class="user-account">
            <h2><i class="fas fa-user-circle"></i> My Account</h2>
            <div class="user-info">
                <h3>Welcome, ${currentUser.name}!</h3>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Phone:</strong> ${currentUser.phone}</p>
                <p><strong>Member since:</strong> ${new Date(currentUser.joinDate).toLocaleDateString()}</p>
            </div>
            <div class="account-actions">
                <button class="btn btn-primary" onclick="closeModal(); showOrderHistory()">
                    <i class="fas fa-history"></i> Order History
                </button>
                <button class="btn btn-secondary" onclick="logout(); closeModal()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function showOrderHistory() {
    if (!currentUser) {
        showNotification('Please login to view order history', 'info');
        showLoginModal();
        return;
    }
    
    const userOrders = orderHistory.filter(order => order.customerId === currentUser.id);
    
    if (userOrders.length === 0) {
        const modal = createModal(`
            <div class="order-history">
                <h2><i class="fas fa-history"></i> Order History</h2>
                <div class="empty-orders">
                    <i class="fas fa-clipboard-list" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
                    <button class="btn btn-primary" onclick="closeModal(); window.location.href='food.html'">
                        Start Shopping
                    </button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
        return;
    }
    
    const ordersHTML = userOrders.map(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString();
        
        if (order.type === 'adoption') {
            return `
                <div class="order-item">
                    <div class="order-header">
                        <h4>🐕 Adoption #${order.id}</h4>
                        <span class="order-status status-${order.status}">${order.status.replace('_', ' ')}</span>
                    </div>
                    <p><strong>${order.puppyName}</strong> - ${order.breed}</p>
                    <p class="order-price">${order.price}</p>
                    <p class="order-date">${orderDate}</p>
                    <p class="order-message">${order.message}</p>
                </div>
            `;
        } else {
            return `
                <div class="order-item">
                    <div class="order-header">
                        <h4>🛒 Order #${order.id}</h4>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div class="order-items-list">
                        ${order.items.map(item => `<p>${item.name} (${item.quantity}x)</p>`).join('')}
                    </div>
                    <p class="order-price">Total: $${order.total.toFixed(2)}</p>
                    <p class="order-date">${orderDate}</p>
                </div>
            `;
        }
    }).join('');
    
    const modal = createModal(`
        <div class="order-history">
            <h2><i class="fas fa-history"></i> Order History</h2>
            <div class="orders-list">
                ${ordersHTML}
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function showOrderConfirmation(order) {
    const modal = createModal(`
        <div class="order-confirmation">
            <div class="confirmation-header">
                <i class="fas fa-check-circle" style="color: #38A169; font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2>Order Confirmed!</h2>
                <p>Order #${order.id}</p>
            </div>
            <div class="order-details">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} (${item.quantity}x)</span>
                            <span>$${item.total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Total: $${order.total.toFixed(2)}</strong>
                </div>
                <p style="margin-top: 1rem; color: #666;">
                    We will process your order and contact you within 24 hours with shipping details.
                </p>
                <button class="btn btn-primary" onclick="closeModal(); showOrderHistory()">
                    View Order History
                </button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function showAdoptionConfirmation(adoption) {
    const modal = createModal(`
        <div class="adoption-confirmation">
            <div class="confirmation-header">
                <i class="fas fa-heart" style="color: #E53E3E; font-size: 3rem; margin-bottom: 1rem;"></i>
                <h2>Adoption Process Started!</h2>
                <p>Adoption #${adoption.id}</p>
            </div>
            <div class="adoption-details">
                <h3>${adoption.puppyName} - ${adoption.breed}</h3>
                <p class="adoption-price">${adoption.price}</p>
                <div class="next-steps">
                    <h4>Next Steps:</h4>
                    <ul>
                        <li><i class="fas fa-phone"></i> We will call you within 24 hours</li>
                        <li><i class="fas fa-calendar"></i> Schedule a meet & greet</li>
                        <li><i class="fas fa-file-alt"></i> Complete adoption paperwork</li>
                        <li><i class="fas fa-home"></i> Take ${adoption.puppyName} home!</li>
                    </ul>
                </div>
                <p style="margin-top: 1rem; color: #666;">
                    Thank you for choosing Pick Your Pup! Our team will contact you soon to arrange the next steps.
                </p>
                <button class="btn btn-primary" onclick="closeModal(); showOrderHistory()">
                    View Order History
                </button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// Other Functions
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card, .puppy-card');
    
    products.forEach(product => {
        if (category === 'all') {
            product.style.display = 'block';
        } else {
            const productCategory = product.dataset.category;
            product.style.display = productCategory === category ? 'block' : 'none';
        }
    });
}

function showSearchModal() {
    const modal = createModal(`
        <div class="search-modal">
            <h2><i class="fas fa-search"></i> Search</h2>
            <div class="search-form">
                <input type="text" placeholder="Search for puppies, food, or accessories..." class="search-input" onkeyup="handleSearch(this.value)">
                <div id="search-results" class="search-results"></div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    modal.querySelector('.search-input').focus();
}

function handleSearch(query) {
    // Simple search implementation
    if (query.length < 2) {
        document.getElementById('search-results').innerHTML = '';
        return;
    }
    
    const results = [
        { name: 'Golden Retriever Puppies', url: 'puppies.html', type: 'Puppy' },
        { name: 'Premium Dog Food', url: 'food.html', type: 'Food' },
        { name: 'Dog Accessories', url: 'accessories.html', type: 'Accessory' },
        { name: 'Contact Us', url: 'contact.html', type: 'Page' }
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    
    const resultsHTML = results.map(result => `
        <div class="search-result" onclick="window.location.href='${result.url}'; closeModal();">
            <h4>${result.name}</h4>
            <span class="result-type">${result.type}</span>
        </div>
    `).join('');
    
    document.getElementById('search-results').innerHTML = resultsHTML || '<p>No results found</p>';
}

function showFavoritesModal() {
    const modal = createModal(`
        <div class="favorites-modal">
            <h2><i class="fas fa-heart"></i> Your Favorites</h2>
            <div class="favorites-content">
                <div class="empty-favorites">
                    <i class="fas fa-heart" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <h3>No favorites yet</h3>
                    <p>Click the heart icon on puppies you love to save them here!</p>
                    <button class="btn btn-primary" onclick="closeModal(); window.location.href='puppies.html'">
                        Browse Puppies
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

// Animation and UI
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.need-card, .puppy-card, .product-card, .section-header'
    );
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Initialize product purchase on all pages
function initializeProductPurchase() {
    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully! We will get back to you within 24 hours.', 'success');
            this.reset();
        });
    }
}

// Utility Functions
function createModal(content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            ${content}
        </div>
    `;
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    return overlay;
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

console.log('Pick Your Pup website with full functionality loaded! 🐕🛒');
