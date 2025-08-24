const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Create or connect to the database
const db = new sqlite3.Database('pick_your_pup.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables
function setupDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Puppies table
        db.run(`CREATE TABLE IF NOT EXISTS puppies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            breed TEXT NOT NULL,
            age TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            rating DECIMAL(2,1) DEFAULT 5.0,
            status TEXT DEFAULT 'available',
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Products table (Food & Accessories)
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            original_price DECIMAL(10,2),
            size TEXT,
            description TEXT,
            rating DECIMAL(2,1) DEFAULT 5.0,
            image_url TEXT,
            in_stock BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            status TEXT DEFAULT 'processing',
            total_amount DECIMAL(10,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Order items table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            puppy_id INTEGER,
            quantity INTEGER DEFAULT 1,
            price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (puppy_id) REFERENCES puppies(id)
        )`);

        // Cart table
        db.run(`CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`, () => {
            console.log('Database tables created successfully');
            
            // Insert sample data after tables are created
            insertSampleData();
        });
    });
}

function insertSampleData() {
    // Sample puppies
    const puppies = [
        ['Luna', 'Labrador Retriever', '6 weeks old', 2500.00, 'Sweet and gentle Luna loves playing fetch and enjoys attention.', 5.0, 'reserved'],
        ['Max', 'German Shepherd', '8 weeks old', 3200.00, 'Intelligent and loyal Max is perfect for active families.', 4.9, 'available'],
        ['Bella', 'French Bulldog', '12 weeks old', 4500.00, 'Adorable Bella has a playful personality and loves attention.', 5.0, 'available'],
        ['Charlie', 'Beagle', '9 weeks old', 2200.00, 'Curious Charlie loves exploring and making new friends.', 4.8, 'available'],
        ['Zeus', 'Husky', '11 weeks old', 3800.00, 'Energetic Zeus loves outdoor adventures and cold weather.', 4.9, 'reserved'],
        ['Daisy', 'Poodle', '7 weeks old', 2800.00, 'Sweet and hypoallergenic Daisy is perfect for any family.', 5.0, 'available'],
        ['Rocky', 'Boxer', '14 weeks old', 2900.00, 'Playful Rocky is full of energy and loves to play games.', 4.7, 'available'],
        ['Milo', 'Corgi', '10 weeks old', 3500.00, 'Adorable Milo has short legs and a big personality.', 4.8, 'available']
    ];

    const puppyStmt = db.prepare(`INSERT OR IGNORE INTO puppies (name, breed, age, price, description, rating, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    puppies.forEach(puppy => {
        puppyStmt.run(puppy);
    });
    puppyStmt.finalize();

    // Sample food products
    const foodProducts = [
        ['Premium Puppy Kibble', 'PurePup Pro', 'food', 'dry', 45.99, 53.99, '25 lbs', 'High-quality protein blend perfect for growing puppies.', 4.8],
        ['Adult Dog Formula', 'HealthyBite', 'food', 'dry', 38.99, null, '30 lbs', 'Organic ingredients for optimal adult dog nutrition.', 4.9],
        ['Wet Food Variety Pack', 'Gourmet Pup', 'food', 'wet', 24.99, null, '12 pack', 'Delicious wet food with real meat and vegetables.', 4.7],
        ['Training Treats', 'PupReward', 'food', 'treats', 12.99, null, '16 oz', 'Low-calorie treats perfect for training sessions.', 4.9],
        ['Senior Dog Formula', 'WiseAge', 'food', 'dry', 42.99, 47.99, '20 lbs', 'Specially formulated for senior dogs with joint support.', 4.6],
        ['Grain-Free Recipe', 'PurePup', 'food', 'dry', 54.99, null, '28 lbs', 'Grain-free formula with sweet potato and real meat.', 4.8]
    ];

    const foodStmt = db.prepare(`INSERT OR IGNORE INTO products (name, brand, category, type, price, original_price, size, description, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    foodProducts.forEach(product => {
        foodStmt.run(product);
    });
    foodStmt.finalize();

    // Sample accessories
    const accessories = [
        ['Luxury Leather Collar', 'ElegantPup', 'accessories', 'collars', 34.99, 42.99, 'Small, Medium, Large', 'Premium leather collar with brass buckle and personalized nameplate.', 4.9],
        ['Modern Retractable Leash', 'WalkEasy', 'accessories', 'collars', 28.99, null, '16ft, 26ft', 'Ergonomic design with anti-slip handle and one-touch braking system.', 4.7],
        ['Comfort Cloud Bed', 'DreamyPaws', 'accessories', 'beds', 89.99, 109.99, 'Small, Medium, Large, XL', 'Memory foam bed with removable washable cover and orthopedic support.', 4.8],
        ['Interactive Rope Ball', 'PlayTime', 'accessories', 'toys', 15.99, null, 'One Size', 'Durable cotton rope toy that helps clean teeth while playing.', 4.8],
        ['Stainless Steel Bowl Set', 'FeedWell', 'accessories', 'feeding', 24.99, null, 'Small, Large', 'Non-slip base bowls with elevated stand for better digestion.', 4.9],
        ['Travel Carrier Bag', 'GoAnywhere', 'accessories', 'beds', 67.99, 82.99, 'Small, Medium', 'Airline-approved carrier with mesh ventilation and comfort padding.', 4.5]
    ];

    const accessoryStmt = db.prepare(`INSERT OR IGNORE INTO products (name, brand, category, type, price, original_price, size, description, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    accessories.forEach(product => {
        accessoryStmt.run(product);
    });
    accessoryStmt.finalize();

    console.log('Sample data inserted successfully');
}

// Run setup
setupDatabase();

// Close database connection
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database setup completed and connection closed');
        }
    });
}, 1000);
