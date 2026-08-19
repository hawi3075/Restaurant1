# Restaurant Order Management System (ROMS) - Ma'ad

A comprehensive full-stack restaurant order management system built with React, Node.js, Express, Prisma, and PostgreSQL. The system supports multiple user roles including customers, admins, chefs, waiters, and delivery drivers with real-time order tracking and notifications.

## 🌟 Features

### Customer Features
- Browse restaurants and food menus
- Search and filter restaurants by category, location, and ratings
- Add items to cart with customizable add-ons
- Place orders for delivery or dine-in
- Track order status in real-time
- Leave reviews and ratings for completed orders
- Manage multiple delivery addresses
- View order history
- Live chat support
- Multi-language support (English, Amharic, Afaan Oromo)
- Light/Dark mode toggle

### Chef Features
- View incoming orders in real-time
- Accept and manage order preparation
- Update order status (Pending → Confirmed → Preparing → Ready)
- Filter orders by status
- Urgent order indicators
- Real-time notifications for new orders

### Waiter Features
- Manage dine-in orders
- Table management
- Coordinate with kitchen
- Serve customers
- Real-time notifications when food is ready

### Driver Features
- View available delivery orders
- Accept delivery assignments
- Update delivery status
- Track earnings
- View delivery locations and customer contacts

### Admin Features
- Dashboard with statistics and analytics
- Manage restaurants, foods, categories
- View and manage customers
- Monitor all orders
- Manage staff (chefs, waiters, drivers)
- View reviews and ratings

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Lucide Icons
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT Authentication
- Bcrypt

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant
```

### 2. Setup Backend

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/roms_db"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

Replace `username` and `password` with your PostgreSQL credentials.

### 4. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:push
```

### 5. Setup Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎮 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

## 👥 Test Accounts

After seeding the database, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@maad.com | password123 |
| Customer | abebe@example.com | password123 |
| Customer | hawi@example.com | password123 |
| Chef | chef.tadesse@maad.com | password123 |
| Waiter | meron.waiter@maad.com | password123 |
| Driver | solomon.driver@maad.com | password123 |

## 📁 Project Structure

```
restaurant/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── server.js     # Entry point
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.js       # Database seeding script
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create restaurant (Admin)
- `PUT /api/restaurants/:id` - Update restaurant (Admin)

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get food by ID
- `POST /api/foods` - Create food (Admin)
- `PUT /api/foods/:id` - Update food (Admin)

### Orders
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

### Reviews
- `GET /api/reviews/food/:foodId` - Get reviews for food
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review (Admin)

## 🔌 Socket.IO Events

### Client → Server
- `join_room` - Join restaurant/user room
- `send_message` - Send chat message
- `update_order_status` - Update order status
- `user_typing` - Typing indicator

### Server → Client
- `new_order` - New order notification
- `order_status_updated` - Order status changed
- `receive_message` - Receive chat message
- `notification` - General notification

## 🌍 Internationalization

Supported languages:
- English (en)
- Amharic (አማርኛ)
- Afaan Oromo (Afaan Oromoo)

## 🎨 Theme Support

- Light Mode (default)
- Dark Mode (in development)

## 📝 Database Schema

The system uses the following main models:
- User
- Restaurant
- Food
- FoodCategory
- Order
- OrderItem
- Payment
- Review
- Table
- Inventory
- Address

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For support, email support@maad.com or join our live chat in the application.

## 🙏 Acknowledgments

- Built for Ethiopian restaurant businesses
- Supports local payment methods (Chapa, TeleBirr)
- Multilingual support for Ethiopian languages
- Designed for Ethiopian market needs

---

Made with ❤️ for Ethiopian Restaurants
