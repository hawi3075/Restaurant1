/**
 * RAG Context for Ma'ad AI Support
 * Contains site-specific information for the AI to use
 */

const siteContext = `
# Ma'ad Restaurant Delivery Platform

## About Ma'ad
Ma'ad is a restaurant and food delivery platform based in Adama, Ethiopia. We provide traditional Ethiopian cuisine with fast delivery service.

## Key Information
- **Service Area**: Adama, Ethiopia with branches in:
  - Adama Main Branch
  - Bole Branch  
  - Megenagna Branch
  - Hawassa Branch
  - Shashamane Branch

- **Delivery Fee**: 50 ETB standard delivery charge
- **Cuisine**: Traditional Ethiopian foods including:
  - Doro Wot (spiced chicken stew)
  - Kitfo (minced raw beef)
  - Tibs (sautéed meat)
  - Shiro (chickpea flour paste)
  - Injera (fermented flatbread)

## Payment Methods
- **Chapa Payment Gateway**: Secure online payments in Ethiopian Birr (ETB)
- Multiple payment options supported

## User Roles
- **Customer**: Can browse menus, place orders, track deliveries
- **Chef**: Manages food preparation, kitchen operations
- **Waiter**: Handles dine-in orders and table management
- **Driver**: Manages deliveries and customer handoff
- **Admin**: Manages restaurants, staff, orders, and platform settings
- **Super Admin**: Full platform access and management

## Features
- **AI Chat Support**: Answers questions about menu, orders, delivery, and payments
- **Real-time Notifications**: Socket.IO powered live updates
- **Restaurant Management**: Admin dashboard for restaurant operations
- **POS System**: Point of Sale system for restaurant transactions
- **Order Tracking**: Real-time order status updates
- **Employee Management**: Role-based staff management

## Common Questions & Answers

### Delivery
Q: How long does delivery take?
A: Standard delivery takes 30-60 minutes depending on location and order complexity.

Q: What is the delivery fee?
A: The standard delivery fee is 50 ETB for orders within Adama.

### Payments
Q: What payment methods do you accept?
A: We accept Chapa online payments. TEST mode uses test payment keys for development.

### Menu
Q: What Ethiopian dishes do you serve?
A: We serve authentic Ethiopian cuisine including Doro Wot, Kitfo, Tibs, Shiro, and more.

Q: Do you serve Injera?
A: Yes, Injera (traditional fermented flatbread) is included with all meals.

### Orders
Q: How do I track my order?
A: You can track your order in real-time through the app once it's confirmed.

Q: Can I change my order after placing it?
A: You can modify orders within the first 5 minutes of placement.

### Account
Q: How do I create an account?
A: Visit the signup page, provide your email, phone, and password to create an account.

Q: How do I reset my password?
A: Click "Forgot Password" on the login page and follow the email instructions.

## Support
For additional help, contact:
- Email: support@maad.com
- Phone: +251 900 000 000
- Use the in-app support chat
`;

module.exports = { siteContext };
