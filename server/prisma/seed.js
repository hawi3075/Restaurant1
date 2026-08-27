const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.foodAddon.deleteMany();
  await prisma.food.deleteMany();
  await prisma.foodCategory.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  console.log('👥 Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@maad.com',
      password: hashedPassword,
      phone: '+251911234567',
      role: 'ADMIN',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Abebe Kebede',
      email: 'abebe@example.com',
      password: hashedPassword,
      phone: '+251912345678',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Hawi Girma',
      email: 'hawi@example.com',
      password: hashedPassword,
      phone: '+251923456789',
      role: 'CUSTOMER',
    },
  });

  // 2. Create Restaurants
  console.log('🏪 Creating restaurants...');
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: 'Yod Abyssinia Restaurant',
      logo: '/m7.webp',
      coverImage: '/m8.webp',
      description: 'Traditional Ethiopian cuisine with live cultural shows',
      address: 'Bole Road, Addis Ababa',
      latitude: 9.0320,
      longitude: 38.7469,
      phone: '+251116629595',
      openingHours: '08:00',
      closingHours: '23:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.8,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: 'Tomoca Coffee',
      logo: '/m1.webp',
      coverImage: '/m7.webp',
      description: 'Iconic Ethiopian coffee house since 1953',
      address: 'Wawel Street, Piazza, Addis Ababa',
      latitude: 9.0340,
      longitude: 38.7520,
      phone: '+251111560212',
      openingHours: '06:00',
      closingHours: '21:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.9,
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      name: 'Habesha 2000 Restaurant',
      logo: '/m8.webp',
      coverImage: '/m1.webp',
      description: 'Modern Ethiopian dining experience',
      address: 'Kazanchis, Addis Ababa',
      latitude: 9.0250,
      longitude: 38.7600,
      phone: '+251911876543',
      openingHours: '10:00',
      closingHours: '22:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.6,
    },
  });

  // Create staff for restaurants
  const chef1 = await prisma.user.create({
    data: {
      name: 'Chef Tadesse',
      email: 'chef.tadesse@maad.com',
      password: hashedPassword,
      phone: '+251934567890',
      role: 'CHEF',
      restaurantId: restaurant1.id,
    },
  });

  const waiter1 = await prisma.user.create({
    data: {
      name: 'Meron Assefa',
      email: 'meron.waiter@maad.com',
      password: hashedPassword,
      phone: '+251945678901',
      role: 'WAITER',
      restaurantId: restaurant1.id,
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      name: 'Solomon Tesfaye',
      email: 'solomon.driver@maad.com',
      password: hashedPassword,
      phone: '+251956789012',
      role: 'DRIVER',
    },
  });

  // 3. Create Food Categories
  console.log('🍽️  Creating food categories...');
  const categoryEthiopian = await prisma.foodCategory.create({
    data: {
      name: 'Ethiopian Food',
      image: '/m7.webp',
    },
  });

  const categoryCoffee = await prisma.foodCategory.create({
    data: {
      name: 'Coffee & Beverages',
      image: '/m1.webp',
    },
  });

  const categoryFastFood = await prisma.foodCategory.create({
    data: {
      name: 'Fast Food',
      image: '/m8.webp',
    },
  });

  const categoryDessert = await prisma.foodCategory.create({
    data: {
      name: 'Desserts',
      image: '/m1.webp',
    },
  });

  // 4. Create Foods
  console.log('🍕 Creating foods...');
  const food1 = await prisma.food.create({
    data: {
      name: 'Doro Wot with Injera',
      description: 'Traditional Ethiopian chicken stew with hard-boiled eggs',
      price: 250.00,
      image: '/m7.webp',
      isPopular: true,
      isAvailable: true,
      categoryId: categoryEthiopian.id,
      restaurantId: restaurant1.id,
    },
  });

  const food2 = await prisma.food.create({
    data: {
      name: 'Kitfo',
      description: 'Ethiopian minced raw beef marinated in mitmita and butter',
      price: 300.00,
      image: '/m8.webp',
      isPopular: true,
      isAvailable: true,
      categoryId: categoryEthiopian.id,
      restaurantId: restaurant1.id,
    },
  });

  const food3 = await prisma.food.create({
    data: {
      name: 'Ethiopian Coffee Ceremony',
      description: 'Traditional coffee ceremony with popcorn',
      price: 80.00,
      image: '/m1.webp',
      isPopular: true,
      isAvailable: true,
      categoryId: categoryCoffee.id,
      restaurantId: restaurant2.id,
    },
  });

  const food4 = await prisma.food.create({
    data: {
      name: 'Macchiato',
      description: 'Ethiopian style macchiato with thick foam',
      price: 50.00,
      image: '/m7.webp',
      isPopular: true,
      isAvailable: true,
      categoryId: categoryCoffee.id,
      restaurantId: restaurant2.id,
    },
  });

  const food5 = await prisma.food.create({
    data: {
      name: 'Tibs',
      description: 'Sautéed meat with vegetables and spices',
      price: 280.00,
      image: '/m1.webp',
      isPopular: false,
      isAvailable: true,
      categoryId: categoryEthiopian.id,
      restaurantId: restaurant3.id,
    },
  });

  const food6 = await prisma.food.create({
    data: {
      name: 'Shiro Wot',
      description: 'Chickpea stew with berbere spice',
      price: 120.00,
      image: '/m8.webp',
      isPopular: false,
      isAvailable: true,
      categoryId: categoryEthiopian.id,
      restaurantId: restaurant3.id,
    },
  });

  // 5. Create Food Add-ons
  console.log('➕ Creating food add-ons...');
  await prisma.foodAddon.createMany({
    data: [
      { name: 'Extra Injera', price: 30.00, foodId: food1.id },
      { name: 'Extra Egg', price: 25.00, foodId: food1.id },
      { name: 'Extra Meat', price: 100.00, foodId: food2.id },
      { name: 'Extra Coffee', price: 30.00, foodId: food3.id },
    ],
  });

  // 6. Create Tables
  console.log('🪑 Creating tables...');
  await prisma.table.createMany({
    data: [
      { tableNumber: '1', capacity: 4, status: 'AVAILABLE', restaurantId: restaurant1.id },
      { tableNumber: '2', capacity: 4, status: 'AVAILABLE', restaurantId: restaurant1.id },
      { tableNumber: '3', capacity: 6, status: 'AVAILABLE', restaurantId: restaurant1.id },
      { tableNumber: '4', capacity: 2, status: 'OCCUPIED', restaurantId: restaurant1.id },
      { tableNumber: '1', capacity: 4, status: 'AVAILABLE', restaurantId: restaurant2.id },
      { tableNumber: '2', capacity: 4, status: 'AVAILABLE', restaurantId: restaurant2.id },
    ],
  });

  // 7. Create Sample Orders
  console.log('📦 Creating sample orders...');
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      restaurantId: restaurant1.id,
      orderType: 'DELIVERY',
      status: 'COMPLETED',
      totalAmount: 530.00,
      deliveryFee: 50.00,
      specialInstructions: 'Please call when arriving',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, foodId: food1.id, quantity: 2, unitPrice: 250.00 },
      { orderId: order1.id, foodId: food4.id, quantity: 1, unitPrice: 50.00 },
    ],
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 530.00,
      method: 'CASH',
      status: 'COMPLETED',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      restaurantId: restaurant1.id,
      orderType: 'DELIVERY',
      status: 'PREPARING',
      totalAmount: 430.00,
      deliveryFee: 50.00,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order2.id, foodId: food2.id, quantity: 1, unitPrice: 300.00 },
      { orderId: order2.id, foodId: food3.id, quantity: 1, unitPrice: 80.00 },
    ],
  });

  // 8. Create Reviews
  console.log('⭐ Creating reviews...');
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: 'Absolutely delicious! Best Doro Wot in Addis!',
        customerId: customer1.id,
        foodId: food1.id,
      },
      {
        rating: 5,
        comment: 'Authentic Ethiopian coffee experience. Highly recommended!',
        customerId: customer2.id,
        foodId: food3.id,
      },
      {
        rating: 4,
        comment: 'Great taste, generous portions.',
        customerId: customer1.id,
        foodId: food2.id,
      },
    ],
  });

  // 9. Create Addresses
  console.log('📍 Creating addresses...');
  await prisma.address.createMany({
    data: [
      {
        title: 'Home',
        fullAddress: 'CMC, Near Zemen Bank, Addis Ababa',
        latitude: 9.0180,
        longitude: 38.7500,
        userId: customer1.id,
      },
      {
        title: 'Office',
        fullAddress: 'Bole, Atlas Building, 5th Floor, Addis Ababa',
        latitude: 9.0150,
        longitude: 38.7600,
        userId: customer1.id,
      },
      {
        title: 'Home',
        fullAddress: '22 Mazoria, Near Sheraton Hotel, Addis Ababa',
        latitude: 9.0250,
        longitude: 38.7580,
        userId: customer2.id,
      },
    ],
  });

  // 10. Create Inventory
  console.log('📊 Creating inventory items...');
  await prisma.inventory.createMany({
    data: [
      {
        itemName: 'Chicken',
        quantity: 50.0,
        unit: 'kg',
        minimumStock: 10.0,
        restaurantId: restaurant1.id,
      },
      {
        itemName: 'Injera',
        quantity: 100.0,
        unit: 'pcs',
        minimumStock: 20.0,
        restaurantId: restaurant1.id,
      },
      {
        itemName: 'Coffee Beans',
        quantity: 25.0,
        unit: 'kg',
        minimumStock: 5.0,
        restaurantId: restaurant2.id,
      },
      {
        itemName: 'Beef',
        quantity: 30.0,
        unit: 'kg',
        minimumStock: 10.0,
        restaurantId: restaurant3.id,
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('   Admin: admin@maad.com / password123');
  console.log('   Customer 1: abebe@example.com / password123');
  console.log('   Customer 2: hawi@example.com / password123');
  console.log('   Chef: chef.tadesse@maad.com / password123');
  console.log('   Waiter: meron.waiter@maad.com / password123');
  console.log('   Driver: solomon.driver@maad.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
