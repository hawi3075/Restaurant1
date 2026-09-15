// Script to clean up old pending orders that are older than 1 day
// Run this with: node cleanup-old-orders.js

const prisma = require('./src/config/prisma');

async function cleanupOldOrders() {
  try {
    console.log('🧹 Cleaning up old pending orders...');
    
    // Find orders older than 1 day that are still PENDING
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const oldOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneDayAgo
        }
      },
      include: {
        items: true,
        payment: true
      }
    });

    console.log(`📋 Found ${oldOrders.length} old pending orders`);

    if (oldOrders.length === 0) {
      console.log('✅ No old orders to clean up');
      return;
    }

    // List the orders before cleanup
    oldOrders.forEach(order => {
      console.log(`🔍 Order ${order.id.slice(0, 8)} - Created: ${order.createdAt} - Status: ${order.status}`);
    });

    console.log('\n⚠️  These orders will be deleted. Press Ctrl+C to cancel or wait 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete order items and payments first (due to foreign key constraints)
    for (const order of oldOrders) {
      // Delete order items
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id }
      });
      
      // Delete payments if any
      await prisma.payment.deleteMany({
        where: { orderId: order.id }
      });
      
      // Delete the order
      await prisma.order.delete({
        where: { id: order.id }
      });
      
      console.log(`🗑️ Deleted order ${order.id.slice(0, 8)}`);
    }

    console.log(`✅ Cleaned up ${oldOrders.length} old pending orders`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldOrders();