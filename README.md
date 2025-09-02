# 🐕 Pick Your Pup - Full-Stack E-commerce Website

**A complete luxury e-commerce platform for pet adoption, food, and accessories with real database backend**  
📌 *This project is created for self-study and practice purposes only.*

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Database](https://img.shields.io/badge/Database-SQLite-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-yellow.svg)

## 🌟 Features

### 🎨 **Premium Frontend Design**
- **Luxury Interface**: Beautiful, modern design with premium styling
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations, hover effects, and intuitive navigation
- **Figma-Based Design**: Precisely implemented from professional design mockups

### 🗄️ **Complete Database Backend**
- **Node.js + Express**: RESTful API server
- **SQLite Database**: 6 tables with relational data structure
- **JWT Authentication**: Secure token-based user authentication
- **Real Data Persistence**: All user data, cart items, and orders stored in database

### 🛒 **Full E-commerce Functionality**
- **User Authentication**: Register, login, secure sessions
- **Shopping Cart**: Database-backed cart with persistence
- **Order Management**: Complete order history and tracking
- **Product Catalog**: Food and accessories with filtering
- **Puppy Adoption**: Special adoption process with status tracking

### 🔐 **Security Features**
- **Password Hashing**: Bcrypt encryption for user passwords
- **JWT Tokens**: Secure authentication with 24-hour expiration
- **SQL Injection Protection**: Parameterized queries
- **Input Validation**: Comprehensive form validation

## 🏗️ Architecture

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Animations, Responsive design
- **JavaScript**: ES6+, Async/Await, Fetch API
- **Design**: Figma-based implementation

### Backend Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **SQLite**: Database (with option to upgrade to PostgreSQL)
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **CORS**: Cross-origin resource sharing

### Database Schema
```
Users → Cart → Orders → Order Items
  ↓        ↓       ↓
Puppies  Products  (Puppies/Products)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (protected)

### Data Endpoints
- `GET /api/puppies` - Get all available puppies
- `GET /api/products` - Get products (with category filtering)
- `GET /api/search?q=term` - Search puppies and products

### Cart & Orders (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Create order
- `GET /api/orders` - Get order history

## 📁 Project Structure

```
Pick-Your-Pup/
├── 📱 Frontend Files
│   ├── index.html              # Home page
│   ├── puppies.html            # Puppies catalog
│   ├── food.html               # Food products
│   ├── accessories.html        # Accessories catalog
│   ├── contact.html            # Contact page
│   ├── styles.css              # Main stylesheet
│   └── script.js               # Frontend JavaScript
├── 🔧 Backend Files
│   ├── server.js               # Express server
│   ├── setup-database.js       # Database initialization
│   ├── api-service.js          # Frontend API client
│   └── package.json            # Dependencies
├── 🗄️ Database
│   └── pick_your_pup.db        # SQLite database
├── 📋 Scripts
    ├── install-and-run.bat     # One-click setup
    └── push-to-github.bat      # GitHub deployment

```
