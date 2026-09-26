const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users (using upsert to avoid conflicts)
  console.log('👥 Creating/updating users...');
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@maad.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@maad.com',
      password: hashedPassword,
      phone: '+251900000000',
      role: 'SUPER_ADMIN',
    },
  });
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maad.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@maad.com',
      password: hashedPassword,
      phone: '+251911234567',
      role: 'ADMIN',
    },
  });

  // 2. Create Food Categories
  console.log('🍽️  Creating food categories...');
  
  const categories = [
    { name: 'Ethiopian Traditional', image: '/cat-ethiopian.jpg' },
    { name: 'Coffee & Beverages', image: '/cat-coffee.jpg' },
    { name: 'Fast Food', image: '/cat-fastfood.jpg' },
    { name: 'Desserts', image: '/cat-desserts.jpg' },
    { name: 'Pizza & Italian', image: '/cat-pizza.jpg' },
    { name: 'Burgers & Sandwiches', image: '/cat-burgers.jpg' },
    { name: 'Vegetarian & Vegan', image: '/cat-vegetarian.jpg' },
    { name: 'Seafood', image: '/cat-seafood.jpg' },
    { name: 'Grilled & BBQ', image: '/cat-grilled.jpg' },
    { name: 'Breakfast', image: '/cat-breakfast.jpg' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.foodCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }

  // 3. Create Restaurants
  console.log('🏪 Creating restaurants...');
  
  const restaurants = [
    {
      name: 'Yod Abyssinia Restaurant',
      logo: '/m7.webp',
      coverImage: '/m2.webp',
      description: 'Authentic Ethiopian cuisine with traditional ambiance and cultural shows',
      address: 'Bole Road, Addis Ababa',
      latitude: 9.0192,
      longitude: 38.7525,
      phone: '+251911123456',
      openingHours: '11:00',
      closingHours: '23:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.8,
    },
    {
      name: 'Tomoca Coffee',
      logo: '/m6.webp',
      coverImage: '/m3.webp',
      description: 'Premium Ethiopian coffee and light meals',
      address: 'Wawel Street, Piazza, Addis Ababa',
      latitude: 9.0333,
      longitude: 38.7333,
      phone: '+251911654321',
      openingHours: '06:00',
      closingHours: '20:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.9,
    },
    {
      name: 'Habesha 2000 Restaurant',
      logo: '/m8.webp',
      coverImage: '/m1.webp',
      description: 'Modern Ethiopian dining experience with fusion options',
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
    {
      name: 'Bella Italian Restaurant',
      logo: '/bella-logo.jpg',
      coverImage: '/bella-cover.jpg',
      description: 'Authentic Italian cuisine with wood-fired pizza',
      address: 'Mexico Square, Addis Ababa',
      latitude: 9.0150,
      longitude: 38.7450,
      phone: '+251911987654',
      openingHours: '12:00',
      closingHours: '23:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.7,
    },
    {
      name: 'Burger Palace',
      logo: '/burger-logo.jpg',
      coverImage: '/burger-cover.jpg',
      description: 'Gourmet burgers and American-style fast food',
      address: 'CMC Area, Addis Ababa',
      latitude: 9.0100,
      longitude: 38.7400,
      phone: '+251911456789',
      openingHours: '10:00',
      closingHours: '24:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.4,
    },
    {
      name: 'Green Leaf Cafe',
      logo: '/green-logo.jpg',
      coverImage: '/green-cover.jpg',
      description: 'Healthy vegetarian and vegan options',
      address: '4 Kilo, Addis Ababa',
      latitude: 9.0200,
      longitude: 38.7350,
      phone: '+251911321654',
      openingHours: '07:00',
      closingHours: '21:00',
      isDelivery: true,
      isDineIn: true,
      isOpen: true,
      rating: 4.5,
    }
  ];

  const createdRestaurants = [];
  for (const rest of restaurants) {
    // Check if restaurant already exists
    let restaurant = await prisma.restaurant.findFirst({
      where: { name: rest.name }
    });
    
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: rest
      });
      console.log('  ✅ Created restaurant:', rest.name);
    } else {
      console.log('  ℹ️  Restaurant already exists:', rest.name);
    }
    
    createdRestaurants.push(restaurant);
  }

  // 4. Create Staff for Restaurants
  console.log('👨‍🍳 Creating restaurant staff...');
  
  const staff = [
    { name: 'Chef Tadesse', email: 'chef.tadesse@maad.com', phone: '+251934567890', role: 'CHEF', restaurantId: createdRestaurants[0].id },
    { name: 'Meron Assefa', email: 'meron.waiter@maad.com', phone: '+251945678901', role: 'WAITER', restaurantId: createdRestaurants[0].id },
    { name: 'Solomon Driver', email: 'solomon.driver@maad.com', phone: '+251956789012', role: 'DRIVER', restaurantId: null },
    { name: 'Chef Marco', email: 'chef.marco@bella.com', phone: '+251934567891', role: 'CHEF', restaurantId: createdRestaurants[3].id },
    { name: 'Sarah Waiter', email: 'sarah@burger.com', phone: '+251945678902', role: 'WAITER', restaurantId: createdRestaurants[4].id },
  ];

  for (const member of staff) {
    await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: {
        name: member.name,
        email: member.email,
        password: hashedPassword,
        phone: member.phone,
        role: member.role,
        restaurantId: member.restaurantId,
      },
    });
  }

  // 5. Create Foods
  console.log('🍽️  Creating foods...');
  
  const ethiopianCategory = createdCategories.find(c => c.name === 'Ethiopian Traditional');
  const coffeeCategory = createdCategories.find(c => c.name === 'Coffee & Beverages');
  const pizzaCategory = createdCategories.find(c => c.name === 'Pizza & Italian');
  const burgerCategory = createdCategories.find(c => c.name === 'Burgers & Sandwiches');
  const vegetarianCategory = createdCategories.find(c => c.name === 'Vegetarian & Vegan');
  const breakfastCategory = createdCategories.find(c => c.name === 'Breakfast');

  const foods = [
    // Yod Abyssinia Restaurant foods
    {
      name: 'Doro Wot with Injera',
      description: 'Traditional Ethiopian chicken stew served with injera bread',
      price: 250,
      image: '/doro-wot.jpg',
      isPopular: true,
      preparationTime: 35,
      spicyLevel: 'MEDIUM',
      categoryId: ethiopianCategory.id,
      restaurantId: createdRestaurants[0].id,
    },
    {
      name: 'Kitfo',
      description: 'Ethiopian steak tartare seasoned with mitmita and served with ayib cheese',
      price: 300,
      image: '/kitfo.jpg',
      isPopular: true,
      preparationTime: 20,
      spicyLevel: 'HOT',
      categoryId: ethiopianCategory.id,
      restaurantId: createdRestaurants[0].id,
    },
    {
      name: 'Vegetarian Combo',
      description: 'Assortment of vegetarian dishes including shiro, gomen, and misir wot',
      price: 180,
      image: '/veg-combo.jpg',
      isVegetarian: true,
      isVegan: true,
      preparationTime: 25,
      spicyLevel: 'MILD',
      categoryId: ethiopianCategory.id,
      restaurantId: createdRestaurants[0].id,
    },
    
    // Tomoca Coffee foods
    {
      name: 'Ethiopian Coffee Ceremony',
      description: 'Traditional coffee ceremony with fresh roasted beans',
      price: 80,
      image: '/coffee-ceremony.jpg',
      isPopular: true,
      preparationTime: 45,
      categoryId: coffeeCategory.id,
      restaurantId: createdRestaurants[1].id,
    },
    {
      name: 'Macchiato',
      description: 'Ethiopian-style macchiato with steamed milk',
      price: 50,
      image: '/macchiato.jpg',
      preparationTime: 10,
      categoryId: coffeeCategory.id,
      restaurantId: createdRestaurants[1].id,
    },
    {
      name: 'Honey Wine (Tej)',
      description: 'Traditional Ethiopian honey wine',
      price: 120,
      image: '/tej.jpg',
      preparationTime: 5,
      categoryId: coffeeCategory.id,
      restaurantId: createdRestaurants[1].id,
    },
    
    // Habesha 2000 foods  
    {
      name: 'Tibs',
      description: 'Sautéed beef with onions and peppers',
      price: 280,
      image: '/tibs.jpg',
      isPopular: true,
      preparationTime: 25,
      spicyLevel: 'MEDIUM',
      categoryId: ethiopianCategory.id,
      restaurantId: createdRestaurants[2].id,
    },
    {
      name: 'Shiro Wot',
      description: 'Ground chickpea stew with berbere spices',
      price: 120,
      image: '/shiro.jpg',
      isVegetarian: true,
      isVegan: true,
      preparationTime: 20,
      spicyLevel: 'MILD',
      categoryId: ethiopianCategory.id,
      restaurantId: createdRestaurants[2].id,
    },
    
    // Bella Italian foods
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato, mozzarella, and basil',
      price: 320,
      image: '/margherita.jpg',
      isPopular: true,
      isVegetarian: true,
      preparationTime: 18,
      categoryId: pizzaCategory.id,
      restaurantId: createdRestaurants[3].id,
    },
    {
      name: 'Pepperoni Pizza',
      description: 'Wood-fired pizza with spicy pepperoni',
      price: 380,
      image: '/pepperoni.jpg',
      isPopular: true,
      preparationTime: 18,
      categoryId: pizzaCategory.id,
      restaurantId: createdRestaurants[3].id,
    },
    {
      name: 'Spaghetti Carbonara',
      description: 'Creamy pasta with pancetta and parmesan',
      price: 290,
      image: '/carbonara.jpg',
      preparationTime: 15,
      categoryId: pizzaCategory.id,
      restaurantId: createdRestaurants[3].id,
    },
    
    // Burger Palace foods
    {
      name: 'Classic Cheeseburger',
      description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
      price: 180,
      image: '/cheeseburger.jpg',
      isPopular: true,
      preparationTime: 12,
      categoryId: burgerCategory.id,
      restaurantId: createdRestaurants[4].id,
    },
    {
      name: 'BBQ Bacon Burger',
      description: 'Beef patty with crispy bacon and BBQ sauce',
      price: 220,
      image: '/bbq-burger.jpg',
      preparationTime: 15,
      categoryId: burgerCategory.id,
      restaurantId: createdRestaurants[4].id,
    },
    {
      name: 'Chicken Wings',
      description: '8 pieces of buffalo chicken wings with blue cheese dip',
      price: 160,
      image: '/wings.jpg',
      preparationTime: 20,
      spicyLevel: 'MEDIUM',
      categoryId: burgerCategory.id,
      restaurantId: createdRestaurants[4].id,
    },
    
    // Green Leaf Cafe foods
    {
      name: 'Buddha Bowl',
      description: 'Quinoa, roasted vegetables, avocado, and tahini dressing',
      price: 190,
      image: '/buddha-bowl.jpg',
      isVegetarian: true,
      isVegan: true,
      isPopular: true,
      preparationTime: 15,
      categoryId: vegetarianCategory.id,
      restaurantId: createdRestaurants[5].id,
    },
    {
      name: 'Avocado Toast',
      description: 'Whole grain bread topped with smashed avocado and hemp seeds',
      price: 120,
      image: '/avocado-toast.jpg',
      isVegetarian: true,
      isVegan: true,
      preparationTime: 8,
      categoryId: breakfastCategory.id,
      restaurantId: createdRestaurants[5].id,
    },
    {
      name: 'Green Smoothie',
      description: 'Spinach, banana, apple, and coconut milk blend',
      price: 85,
      image: '/green-smoothie.jpg',
      isVegetarian: true,
      isVegan: true,
      preparationTime: 5,
      categoryId: coffeeCategory.id,
      restaurantId: createdRestaurants[5].id,
    },
  ];

  for (const food of foods) {
    // Check if food already exists
    let existingFood = await prisma.food.findFirst({
      where: { name: food.name, restaurantId: food.restaurantId }
    });
    
    if (!existingFood) {
      await prisma.food.create({
        data: food
      });
      console.log('  ✅ Created food:', food.name);
    } else {
      console.log('  ℹ️  Food already exists:', food.name);
    }
  }

  // 6. Create some sample customers
  console.log('👥 Creating sample customers...');
  
  const customers = [
    { name: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251912345678' },
    { name: 'Hawi Girma', email: 'hawi@example.com', phone: '+251923456789' },
    { name: 'Dawit Tesfaye', email: 'dawit@example.com', phone: '+251934567890' },
    { name: 'Marta Solomon', email: 'marta@example.com', phone: '+251945678901' },
  ];

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        name: customer.name,
        email: customer.email,
        password: hashedPassword,
        phone: customer.phone,
        role: 'CUSTOMER',
      },
    });
  }

  console.log('✅ Comprehensive database seeding completed successfully!');
  
  // Show final counts
  const finalCounts = {
    restaurants: await prisma.restaurant.count(),
    categories: await prisma.foodCategory.count(),
    foods: await prisma.food.count(),
    users: await prisma.user.count(),
  };
  
  console.log('\n📊 Final Database Content:');
  console.log('  🏪 Restaurants:', finalCounts.restaurants);
  console.log('  📂 Categories:', finalCounts.categories);
  console.log('  🍽️ Foods:', finalCounts.foods);
  console.log('  👥 Users:', finalCounts.users);
  
  console.log('\n📝 Test Accounts:');
  console.log('   Super Admin: superadmin@maad.com / password123');
  console.log('   Admin: admin@maad.com / password123');
  console.log('   Customer 1: abebe@example.com / password123');
  console.log('   Customer 2: hawi@example.com / password123');
  console.log('   Chef: chef.tadesse@maad.com / password123');
  console.log('   Waiter: meron.waiter@maad.com / password123');
  console.log('   Driver: solomon.driver@maad.com / password123\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });