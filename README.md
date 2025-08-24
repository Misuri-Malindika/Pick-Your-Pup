# 🐕 Pick Your Pup - Full-Stack E-commerce Website

**A complete luxury e-commerce platform for pet adoption, food, and accessories with real database backend**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
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

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- Git

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Pick-Your-Pup.git
cd Pick-Your-Pup
```

2. **One-click setup and start**
```bash
# Windows
.\install-and-run.bat

# Or manual setup:
npm install
node setup-database.js
npm start
```

3. **Access the application**
- **Website**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api

## 📱 Pages & Features

| Page | Features | Database Integration |
|------|----------|---------------------|
| **Home** | Hero section, featured products, company overview | ✅ Live puppy data |
| **Puppies** | Available puppies, filtering, adoption process | ✅ Real-time status updates |
| **Food** | Premium dog food catalog with categories | ✅ Product database |
| **Accessories** | Collars, beds, toys with cart functionality | ✅ Inventory management |
| **Contact** | Contact form, store information | ✅ Message handling |

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

## 📊 Sample Data

The database comes pre-loaded with:
- **8 Puppies**: Various breeds with adoption status tracking
- **6 Food Products**: Premium kibble, wet food, treats
- **6 Accessories**: Collars, leashes, beds, toys

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
│   ├── install-and-run.bat     # One-click setup
│   └── push-to-github.bat      # GitHub deployment
└── 📚 Documentation
    ├── README.md               # This file
    ├── DATABASE_SETUP.md       # Database documentation
    └── START_FULLSTACK.md      # Quick start guide
```

## 🧪 Testing the Full Stack

1. **Create Account**: Register with email/password
2. **Shop for Products**: Add food/accessories to cart
3. **Adopt a Puppy**: Reserve a puppy (creates adoption order)
4. **View Orders**: Check order history with both purchases and adoptions
5. **Persistence Test**: Logout/login - cart and data persist

## 🌐 Deployment Options

### Development (Current)
- SQLite database included
- Node.js server on localhost:3000
- All files included for immediate use

### Production Ready
- **Database**: Upgrade to PostgreSQL for scale
- **Hosting**: Deploy to Heroku, Vercel, or AWS
- **Storage**: Add image hosting (AWS S3, Cloudinary)
- **Monitoring**: Add logging and error tracking

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secure-secret-key
DATABASE_PATH=./pick_your_pup.db
```

### Database Configuration
- **File**: `pick_your_pup.db` (auto-created)
- **Reset**: Delete database file and run `node setup-database.js`
- **Backup**: Copy the `.db` file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design**: Based on professional Figma mockups
- **Icons**: Font Awesome icons
- **Database**: SQLite for simplicity and portability
- **Authentication**: JWT best practices
- **Security**: bcrypt password hashing

## 📞 Support

For support, email support@pickyourpup.com or create an issue in this repository.

---

**🎉 Ready to run! Your complete e-commerce platform with real database backend is ready for deployment!**