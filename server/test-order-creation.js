// Simple test script to verify order creation process
// Run this with: node test-order-creation.js

const prisma = require('./src/config/prisma');

async function testOrderCreation() {
  try {
    console.log('🧪 Testing order creation...');
    
    // Test data similar to what would come from checkout
    const testOrderData = {
      customerId: 'test-customer-id',
      restaurantId: 'test-restaurant-id', 
      orderType: 'DELIVERY',
      totalAmount: 100,
      deliveryFee: 50,
      items: [
        {
          foodId: 'test-food-id',
          quantity: 2,
          price: 25,
          name: 'Test Food Item'
        }
      ]
    };

    console.log('📦 Test order data:', JSON.stringify(testOrderData, null, 2));

    // Check if we can find required records
    const restaurant = await prisma.restaurant.findFirst();
    const food = await prisma.food.findFirst();
    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });

    console.log(`🏪 Found restaurant: ${restaurant?.name || 'None'}`);
    console.log(`🍕 Found food: ${food?.name || 'None'}`);  
    console.log(`👤 Found customer: ${customer?.name || 'None'}`);

    if (!restaurant || !food || !customer) {
      console.log('❌ Missing required data for test. Please ensure you have restaurants, foods, and customers in your database.');
      return;
    }

    // Update test data with real IDs
    testOrderData.customerId = customer.id;
    testOrderData.restaurantId = restaurant.id;
    testOrderData.items[0].foodId = food.id;

    console.log('✅ Updated with real IDs:', {
      customerId: customer.id,
      restaurantId: restaurant.id, 
      foodId: food.id
    });

    // Try creating an order
    const newOrder = await prisma.order.create({
      data: {
        customerId: testOrderData.customerId,
        restaurantId: testOrderData.restaurantId,
        orderType: testOrderData.orderType,
        totalAmount: testOrderData.totalAmount,
        deliveryFee: testOrderData.deliveryFee,
        status: 'PENDING',
        items: {
          create: testOrderData.items.map(item => ({
            foodId: item.foodId,
            quantity: item.quantity,
            unitPrice: item.price,
          }))
        }
      },
      include: {
        items: { include: { food: true } },
        customer: { select: { name: true, phone: true, email: true } },
        restaurant: true,
      },
    });

    console.log('🎉 Order created successfully!');
    console.log('📋 Order details:', JSON.stringify(newOrder, null, 2));

    // Verify it can be found
    const foundOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        items: { include: { food: true } },
        customer: true,
        restaurant: true,
      }
    });

    console.log('🔍 Order verification: Found =', !!foundOrder);
    
    // Clean up test order
    await prisma.orderItem.deleteMany({ where: { orderId: newOrder.id } });
    await prisma.order.delete({ where: { id: newOrder.id } });
    console.log('🧹 Test order cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('📝 Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCreation();