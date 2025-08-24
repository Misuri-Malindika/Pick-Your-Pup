const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
const db = new sqlite3.Database('pick_your_pup.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Helper function to run database queries
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const runInsert = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

// Routes

// User Authentication
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user exists
        const existingUser = await runQuery('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await runInsert(
            'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
            [name, email, phone, hashedPassword]
        );

        // Create token
        const token = jwt.sign({ id: result.id, email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: result.id, name, email, phone }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const users = await runQuery('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                joinDate: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const users = await runQuery('SELECT id, name, email, phone, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Puppies
app.get('/api/puppies', async (req, res) => {
    try {
        const puppies = await runQuery('SELECT * FROM puppies ORDER BY created_at DESC');
        res.json(puppies);
    } catch (error) {
        console.error('Puppies error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/puppies/:id', async (req, res) => {
    try {
        const puppies = await runQuery('SELECT * FROM puppies WHERE id = ?', [req.params.id]);
        if (puppies.length === 0) {
            return res.status(404).json({ error: 'Puppy not found' });
        }
        res.json(puppies[0]);
    } catch (error) {
        console.error('Puppy error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Products (Food & Accessories)
app.get('/api/products', async (req, res) => {
    try {
        const { category, type } = req.query;
        let query = 'SELECT * FROM products WHERE in_stock = 1';
        let params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC';

        const products = await runQuery(query, params);
        res.json(products);
    } catch (error) {
        console.error('Products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cart Management
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const cartItems = await runQuery(`
            SELECT c.*, p.name, p.brand, p.price, p.image_url 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [req.user.id]);

        res.json(cartItems);
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        // Check if item already in cart
        const existingItem = await runQuery(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existingItem.length > 0) {
            // Update quantity
            await runInsert(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, req.user.id, product_id]
            );
        } else {
            // Add new item
            await runInsert(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, product_id, quantity]
            );
        }

        res.json({ message: 'Item added to cart' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/cart/:product_id', authenticateToken, async (req, res) => {
    try {
        await runInsert(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.product_id]
        );

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        await runInsert('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Orders
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { type, items, puppy_id, total_amount } = req.body;

        // Create order
        const orderResult = await runInsert(
            'INSERT INTO orders (user_id, type, total_amount) VALUES (?, ?, ?)',
            [req.user.id, type, total_amount || 0]
        );

        const orderId = orderResult.id;

        if (type === 'adoption' && puppy_id) {
            // Add puppy to order
            await runInsert(
                'INSERT INTO order_items (order_id, puppy_id, price) VALUES (?, ?, ?)',
                [orderId, puppy_id, total_amount]
            );

            // Update puppy status
            await runInsert(
                'UPDATE puppies SET status = ? WHERE id = ?',
                ['reserved', puppy_id]
            );
        } else if (type === 'purchase' && items) {
            // Add products to order
            for (const item of items) {
                await runInsert(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );
            }

            // Clear cart
            await runInsert('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        }

        res.status(201).json({
            message: 'Order created successfully',
            order_id: orderId
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await runQuery(`
            SELECT o.*, 
                   GROUP_CONCAT(
                       CASE 
                           WHEN oi.puppy_id IS NOT NULL THEN p.name || ' (' || p.breed || ')'
                           ELSE pr.name || ' (x' || oi.quantity || ')'
                       END
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN puppies p ON oi.puppy_id = p.id
            LEFT JOIN products pr ON oi.product_id = pr.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        res.json(orders);
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const searchTerm = `%${q}%`;
        
        const puppies = await runQuery(
            'SELECT id, name, breed, price, "puppy" as type FROM puppies WHERE name LIKE ? OR breed LIKE ? AND status = "available"',
            [searchTerm, searchTerm]
        );

        const products = await runQuery(
            'SELECT id, name, brand, price, category as type FROM products WHERE name LIKE ? OR brand LIKE ? AND in_stock = 1',
            [searchTerm, searchTerm]
        );

        res.json([...puppies, ...products]);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // In a real application, you would save this to a database and/or send an email
        console.log('Contact form submission:', { name, email, phone, subject, message });
        
        res.json({ message: 'Message sent successfully! We will get back to you within 24 hours.' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve static files (your HTML, CSS, JS)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, `${page}.html`));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Pick Your Pup server running on http://localhost:${PORT}`);
    console.log('📱 Frontend available at: http://localhost:' + PORT);
    console.log('🔌 API endpoints available at: http://localhost:' + PORT + '/api');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('📦 Database connection closed');
        }
        process.exit(0);
    });
});
