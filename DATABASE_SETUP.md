# Pick Your Pup - Database Backend Setup

## 🗄️ Database Architecture

### Database Technology
- **SQLite**: Lightweight, file-based database (perfect for development and small-scale production)
- **File**: `pick_your_pup.db` (auto-created)
- **Advantages**: No separate database server required, easy deployment, ACID compliant

### Database Schema

#### 1. Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL (bcrypt hashed),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Puppies Table
```sql
CREATE TABLE puppies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    age TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    status TEXT DEFAULT 'available', -- 'available', 'reserved', 'adopted'
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Products Table (Food & Accessories)
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL, -- 'food' or 'accessories'
    type TEXT NOT NULL, -- 'dry', 'wet', 'treats', 'collars', 'toys', etc.
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- for sale items
    size TEXT,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Orders Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'purchase' or 'adoption'
    status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'cancelled'
    total_amount DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 5. Order Items Table
```sql
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER, -- for product purchases
    puppy_id INTEGER, -- for puppy adoptions
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (puppy_id) REFERENCES puppies(id)
);
```

#### 6. Cart Table
```sql
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
node setup-database.js
```

### 3. Start Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (authenticated)

### Puppies
- `GET /api/puppies` - Get all puppies
- `GET /api/puppies/:id` - Get specific puppy

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=food` - Get food products
- `GET /api/products?category=accessories` - Get accessories

### Cart (Authenticated)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:product_id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders (Authenticated)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders

### Other
- `GET /api/search?q=query` - Search puppies and products
- `POST /api/contact` - Send contact message

## 🔐 Authentication

### JWT Token Authentication
- Users receive JWT token on login/register
- Token includes user ID and email
- Token expires in 24 hours
- Required for all protected endpoints

### Password Security
- Passwords hashed using bcryptjs
- Salt rounds: 10
- Never stored in plain text

## 📊 Sample Data

The database setup includes sample data:

### Puppies (8 entries)
- Luna (Labrador Retriever) - Reserved
- Max (German Shepherd) - Available
- Bella (French Bulldog) - Available
- Charlie (Beagle) - Available
- Zeus (Husky) - Reserved
- Daisy (Poodle) - Available
- Rocky (Boxer) - Available
- Milo (Corgi) - Available

### Food Products (6 entries)
- Premium Puppy Kibble
- Adult Dog Formula
- Wet Food Variety Pack
- Training Treats
- Senior Dog Formula
- Grain-Free Recipe

### Accessories (6 entries)
- Luxury Leather Collar
- Modern Retractable Leash
- Comfort Cloud Bed
- Interactive Rope Ball
- Stainless Steel Bowl Set
- Travel Carrier Bag

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_PATH=./pick_your_pup.db
```

### Database Connection
- SQLite file: `pick_your_pup.db`
- Auto-created if doesn't exist
- No additional configuration required

## 🚦 Development vs Production

### Development
- SQLite database (included)
- Console logging enabled
- CORS enabled for all origins
- Detailed error messages

### Production Recommendations
- Consider PostgreSQL or MySQL for scale
- Add proper logging system
- Configure CORS for specific origins
- Add rate limiting
- Use environment-specific JWT secrets
- Add database backup strategy

## 🛠️ Database Management

### View Database Contents
```bash
# Install SQLite CLI (optional)
sqlite3 pick_your_pup.db

# Common queries
.tables                    # List all tables
SELECT * FROM users;       # View all users
SELECT * FROM puppies;     # View all puppies
SELECT * FROM products;    # View all products
SELECT * FROM orders;      # View all orders
```

### Reset Database
```bash
# Delete database file and recreate
rm pick_your_pup.db
node setup-database.js
```

## 🔄 Data Flow

1. **User Registration/Login**
   - Frontend → `/api/auth/register` or `/api/auth/login`
   - Backend validates and returns JWT token
   - Frontend stores token for subsequent requests

2. **Shopping Cart**
   - Add to cart → Frontend → `/api/cart` → Database
   - View cart → Frontend → `/api/cart` → Database → Frontend
   - Checkout → Frontend → `/api/orders` → Database

3. **Puppy Adoption**
   - Reserve puppy → Frontend → `/api/orders` → Database
   - Update puppy status to 'reserved'
   - Create adoption order record

4. **Order History**
   - Frontend → `/api/orders` → Database → Frontend
   - Shows both purchases and adoptions

## 📈 Scalability Considerations

### Current Architecture
- Single SQLite file
- Single Node.js process
- Suitable for: 100-1000 concurrent users

### Scaling Options
1. **Database**: Migrate to PostgreSQL/MySQL
2. **Server**: Add load balancer + multiple instances
3. **Caching**: Add Redis for sessions/cart
4. **CDN**: Static assets (images) via CDN
5. **Microservices**: Split into separate services

## 🔍 Monitoring & Debugging

### Logs
- Server logs show all API requests
- Database errors logged to console
- Authentication errors logged

### Common Issues
1. **JWT Token Expired**: User needs to login again
2. **Database Locked**: Restart server if SQLite locked
3. **CORS Errors**: Check origin configuration
4. **404 Errors**: Verify API endpoint URLs

## 🛡️ Security Features

- Password hashing (bcryptjs)
- JWT token authentication
- SQL injection prevention (parameterized queries)
- CORS configuration
- Input validation
- Error handling without sensitive data exposure
