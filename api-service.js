// API Service for Pick Your Pup
class ApiService {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('pickYourPupToken');
    }

    // Helper method to make API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Authentication
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('pickYourPupToken');
        localStorage.removeItem('pickYourPupUser');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('pickYourPupToken', token);
    }

    async getUserProfile() {
        return await this.request('/user/profile');
    }

    // Puppies
    async getPuppies() {
        return await this.request('/puppies');
    }

    async getPuppy(id) {
        return await this.request(`/puppies/${id}`);
    }

    // Products
    async getProducts(category = null, type = null) {
        let query = '';
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (type) params.append('type', type);
        
        if (params.toString()) {
            query = '?' + params.toString();
        }

        return await this.request(`/products${query}`);
    }

    // Cart
    async getCart() {
        return await this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return await this.request('/cart', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    async removeFromCart(productId) {
        return await this.request(`/cart/${productId}`, {
            method: 'DELETE'
        });
    }

    async clearCart() {
        return await this.request('/cart', {
            method: 'DELETE'
        });
    }

    // Orders
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request('/orders');
    }

    // Search
    async search(query) {
        return await this.request(`/search?q=${encodeURIComponent(query)}`);
    }

    // Contact
    async sendContactMessage(messageData) {
        return await this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    // Helper method to check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }
}

// Create global instance
window.apiService = new ApiService();
