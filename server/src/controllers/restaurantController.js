const prisma = require('../config/prisma');

// Get all restaurants
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        foods: {
          include: { 
            category: true,
            addons: true
          }
        },
        tables: true,
      },
    });
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Internal server error while fetching restaurants.' });
  }
};

// Get single restaurant by ID with its menu categories and foods
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        foods: {
          include: { category: true, addons: true },
        },
        tables: true,
        staff: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Create a new restaurant (Admin only)
const createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, openingHours, closingHours, description, logo, coverImage, latitude, longitude } = req.body;

    if (!name || !address || !phone || !openingHours || !closingHours) {
      return res.status(400).json({ error: 'Please provide all required restaurant details.' });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        address,
        phone,
        openingHours,
        closingHours,
        description,
        logo,
        coverImage,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: 'Internal server error during restaurant creation.' });
  }
};

// Update a restaurant (Admin only)
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, rating, isOpen, logo, coverImage, description, openingHours, closingHours } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(isOpen !== undefined && { isOpen }),
        ...(logo !== undefined && { logo }),
        ...(coverImage !== undefined && { coverImage }),
        ...(description !== undefined && { description }),
        ...(openingHours !== undefined && { openingHours }),
        ...(closingHours !== undefined && { closingHours })
      }
    });

    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: 'Internal server error during restaurant update.' });
  }
};

// Delete a restaurant and cascade related records (Admin only)
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // We do cascading delete manually inside a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Set restaurantId to null for staff
      await tx.user.updateMany({
        where: { restaurantId: id },
        data: { restaurantId: null }
      });

      // 2. Delete payments, order items, status history for orders of this restaurant
      const orders = await tx.order.findMany({
        where: { restaurantId: id },
        select: { id: true }
      });
      const orderIds = orders.map(o => o.id);

      if (orderIds.length > 0) {
        await tx.payment.deleteMany({
          where: { orderId: { in: orderIds } }
        });
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } }
        });
        await tx.orderStatusHistory.deleteMany({
          where: { orderId: { in: orderIds } }
        });
        await tx.order.deleteMany({
          where: { restaurantId: id }
        });
      }

      // 3. Delete addons and foods of this restaurant
      const foods = await tx.food.findMany({
        where: { restaurantId: id },
        select: { id: true }
      });
      const foodIds = foods.map(f => f.id);

      if (foodIds.length > 0) {
        await tx.foodAddon.deleteMany({
          where: { foodId: { in: foodIds } }
        });
        await tx.food.deleteMany({
          where: { restaurantId: id }
        });
      }

      // 4. Delete tables of this restaurant
      await tx.table.deleteMany({
        where: { restaurantId: id }
      });

      // 5. Delete inventory of this restaurant
      await tx.inventory.deleteMany({
        where: { restaurantId: id }
      });

      // 6. Delete the restaurant
      await tx.restaurant.delete({
        where: { id }
      });
    });

    res.json({ message: 'Restaurant and all related data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Internal server error during restaurant deletion.' });
  }
};

// Get public aggregate statistics for landing page
const getPublicStats = async (req, res) => {
  try {
    const [branchesCount, customersCount, ordersCount, reviewsCount, foodsCount, chefsCount] = await Promise.all([
      prisma.restaurant.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.review.count(),
      prisma.food.count(),
      prisma.user.count({ where: { role: 'CHEF' } }),
    ]);

    res.json({
      branches: branchesCount,
      customers: customersCount,
      orders: ordersCount,
      reviews: reviewsCount,
      foods: foodsCount,
      chefs: chefsCount,
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Internal server error while fetching public stats.' });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getPublicStats,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};