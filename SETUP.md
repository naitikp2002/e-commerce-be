# E-commerce Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
HOST=localhost
USERNAME=root
PASSWORD=your_password
NAME=ecommerce_db
PORT_NUMBER=3306
DIALECT=mysql

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Database Configuration
Update `config/config.json` with your database credentials:

```json
{
  "development": {
    "username": "your_username",
    "password": "your_password",
    "database": "your_database_name",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

### 4. Database Setup
```bash
# Run migrations
npx sequelize-cli db:migrate

# Seed the database (optional)
npx sequelize-cli db:seed:all
```

## 📋 Available Scripts

- `npm start` - Start the production server with full functionality
- `npm run dev` - Start development server with nodemon (requires .env)
- `npm run dev-start` - Start basic server without database (for testing)
- `npm run build` - Run build validation
- `npm test` - Run tests

## 🔧 Build Process

### Build Validation
```bash
npm run build
```
This will:
- Check all required files exist
- Validate package.json structure
- Check JavaScript syntax
- Verify all dependencies are available

### Development Testing
```bash
npm run dev-start
```
This starts a basic server without database connection for testing the build.

## 🗄️ Database Models

The application includes the following models:
- **User** - User accounts and authentication
- **Product** - Product catalog
- **Category** - Product categories
- **Brand** - Product brands
- **Cart** - Shopping cart items
- **Order** - Customer orders
- **OrderItems** - Individual order items
- **Address** - User addresses
- **Favourites** - User wishlist

## 🔌 API Endpoints

- **Authentication**: `/api/auth`
- **Users**: `/api/users`
- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Brands**: `/api/brands`
- **Cart**: `/api/cart`
- **Favourites**: `/api/favourites`
- **Address**: `/api/address`
- **Payment**: `/api/payment`
- **Orders**: `/api/orders`
- **Order Details**: `/api/order-details`

## 🚨 Troubleshooting

### Common Issues

1. **Missing .env file**
   - Create a `.env` file with required variables
   - Use `.env.example` as a template

2. **Database connection failed**
   - Check database credentials in `config/config.json`
   - Ensure MySQL service is running
   - Verify database exists

3. **Port already in use**
   - Change PORT in `.env` file
   - Kill existing process using the port

4. **Missing dependencies**
   - Run `npm install`
   - Check `package.json` for missing packages

### Build Errors

If you encounter build errors:

1. Run `npm run build` to identify issues
2. Check console output for missing files
3. Verify all required dependencies are installed
4. Ensure Node.js version is 16 or higher

## 📱 Testing the API

### Health Check
```bash
curl http://localhost:8080/
```

### API Status
```bash
curl http://localhost:8080/api/status
```

## 🎯 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use production database credentials
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use environment-specific Stripe keys
6. Set up proper logging and monitoring

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
