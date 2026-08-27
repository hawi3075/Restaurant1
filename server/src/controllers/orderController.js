const prisma = require('../config/prisma');

// Place a new order (Customer or Waiter)
const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      orderType,
      tableId,
      addressId,
      deliveryAddress,
      latitude,
      longitude,
      items,
      deliveryFee,
      discount,
      specialInstructions
    } = req.body;
    const customerId = req.user.id; // From JWT authentication

    let targetRestaurantId = restaurantId;

    if (!items || items.length === 0 || !orderType) {
      return res.status(400).json({ error: 'Please provide order type and order items.' });
    }

    if (!targetRestaurantId) {
      if (items[0]?.foodId) {
        const firstFood = await prisma.food.findUnique({ where: { id: String(items[0].foodId) } });
        if (firstFood && firstFood.restaurantId) {
          targetRestaurantId = firstFood.restaurantId;
        }
      }
      if (!targetRestaurantId) {
        const defaultRest = await prisma.restaurant.findFirst({ where: { name: { contains: 'Yod Abyssinia', mode: 'insensitive' } } })
          || await prisma.restaurant.findFirst();
        if (defaultRest) {
          targetRestaurantId = defaultRest.id;
        }
      }
    }

    if (!targetRestaurantId) {
      return res.status(400).json({ error: 'Please provide restaurant, order type, and order items.' });
    }

    // Calculate total amount from items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      let food = null;
      if (item.foodId) {
        food = await prisma.food.findUnique({ where: { id: String(item.foodId) } });
      }

      if (!food && (item.name || item.foodName)) {
        const searchName = String(item.name || item.foodName);
        food = await prisma.food.findFirst({
          where: { name: { contains: searchName, mode: 'insensitive' } },
        });
      }

      if (!food) {
        food = await prisma.food.findFirst();
      }

      if (!food) {
        return res.status(404).json({ error: `Food item not found: ${item.foodId}` });
      }

      const unitPrice = food.price;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        foodId: food.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
      });
    }

    let effectiveDeliveryFee = deliveryFee;
    if (effectiveDeliveryFee === undefined || effectiveDeliveryFee === null) {
      if (orderType === 'DELIVERY') {
        const settings = await prisma.businessSettings.findFirst();
        effectiveDeliveryFee = settings?.deliveryFee !== undefined ? Number(settings.deliveryFee) : 50;
      } else {
        effectiveDeliveryFee = 0;
      }
    }

    const finalTotal = totalAmount + Number(effectiveDeliveryFee || 0) - (discount || 0);

    let validAddressId = null;
    if (addressId) {
      const existingAddr = await prisma.address.findUnique({ where: { id: addressId } });
      if (existingAddr) validAddressId = addressId;
    }

    // Create order and initial status history inside Neon database
    const order = await prisma.order.create({
      data: {
        customerId,
        restaurantId: targetRestaurantId,
        tableId: tableId || null,
        addressId: validAddressId,
        deliveryAddress: deliveryAddress || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        orderType,
        totalAmount: finalTotal,
        deliveryFee: effectiveDeliveryFee || 0,
        discount: discount || 0,
        specialInstructions,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            notes: 'Order placed successfully',
          },
        },
      },
      include: {
        items: { include: { food: true } },
        customer: { select: { name: true, phone: true, email: true } },
        restaurant: true,
        address: true,
        table: { select: { tableNumber: true, capacity: true } },
      },
    });

    const mappedOrder = {
      ...order,
      tableNumber: order.table?.tableNumber || null,
    };

    // Real-time notification to restaurant staff AND admin via Socket.IO
    const io = req.app.get('io');
    if (io) {
      if (targetRestaurantId) io.to(targetRestaurantId).emit('new_order', mappedOrder);
      io.to('chef_global').emit('new_order', mappedOrder);
      io.to('admin_global').emit('new_order', mappedOrder);
      io.emit('new_order', mappedOrder);
    }

    res.status(201).json({ message: 'Order placed successfully', order: mappedOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error while placing order.' });
  }
};

// Get orders for user (Customer history or Staff/Restaurant queue)
const getOrders = async (req, res) => {
  try {
    const { role, id: userId, restaurantId } = req.user;
    let filters = {};

    if (role === 'CUSTOMER') {
      filters.customerId = userId;
    } else if (['CHEF', 'WAITER'].includes(role) && restaurantId) {
      filters.restaurantId = restaurantId;
    } else if (role !== 'ADMIN' && !['CHEF', 'WAITER', 'DRIVER'].includes(role)) {
      return res.status(403).json({ error: 'Unauthorized access to orders.' });
    }
    // ADMIN, DRIVER, or staff without restaurantId see all orders

    const orders = await prisma.order.findMany({
      where: filters,
      include: {
        items: { include: { food: true } },
        customer: { select: { name: true, phone: true, email: true } },
        restaurant: { select: { name: true, address: true } },
        address: true,
        table: { select: { tableNumber: true, capacity: true } },
        statusHistory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedOrders = orders.map((o) => ({
      ...o,
      tableNumber: o.table?.tableNumber || null,
    }));

    res.json(mappedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update order status (Chef, Waiter, Driver, Admin workflows)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, driverId } = req.body;
    const { role, id: userId } = req.user;

    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PREPARING', 'READY',
      'OUT_FOR_DELIVERY', 'READY_TO_SERVE', 'DELIVERED',
      'SERVED', 'COMPLETED', 'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updateData = {
      status,
      statusHistory: {
        create: {
          status,
          notes: notes || `Status updated to ${status} by ${role}`,
        },
      },
    };

    // Save driver assignment if provided or if action performed by driver
    if (driverId) {
      updateData.driverId = driverId;
    } else if (role === 'DRIVER' && (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED')) {
      updateData.driverId = userId;
    }

    // Update order status and append to status history
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { food: true } },
        customer: true,
        restaurant: true,
        table: { select: { tableNumber: true, capacity: true } },
        statusHistory: true,
      },
    });

    const mappedUpdatedOrder = {
      ...updatedOrder,
      tableNumber: updatedOrder.table?.tableNumber || null,
    };

    // Broadcast real-time update using Socket.IO
    const io = req.app.get('io');
    if (io) {
      if (order.restaurantId) io.to(order.restaurantId).emit('order_status_updated', mappedUpdatedOrder);
      if (order.customerId) io.to(order.customerId).emit('order_status_updated', mappedUpdatedOrder);
      io.to('admin_global').emit('order_status_updated', mappedUpdatedOrder);
      io.to('chef_global').emit('order_status_updated', mappedUpdatedOrder);
      io.to('driver_global').emit('order_status_updated', mappedUpdatedOrder);
      io.emit('order_status_updated', mappedUpdatedOrder);
    }

    res.json({ message: 'Order status updated successfully', order: mappedUpdatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };