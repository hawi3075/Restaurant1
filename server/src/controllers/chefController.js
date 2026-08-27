const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Submit a new food item (Pending admin approval)
 */
const submitFood = async (req, res) => {
  try {
    console.log('=== Chef Submit Food Request ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const {
      name,
      description,
      price,
      categoryId,
      customCategory,
      restaurantId,
      customRestaurant,
      preparationTime,
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel,
      imageUrl,
    } = req.body;

    const chefId = req.user?.id;

    if (!chefId) {
      console.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!name || !description || !price) {
      console.error('Missing required fields:', { name, description, price });
      return res.status(400).json({ 
        success: false, 
        message: 'Name, description, and price are required' 
      });
    }

    // Handle category (custom or existing)
    let finalCategoryId = categoryId;
    if (customCategory) {
      console.log('Creating/finding custom category:', customCategory);
      // Create custom category or find existing
      const existingCategory = await prisma.foodCategory.findFirst({
        where: { name: customCategory }
      });

      if (existingCategory) {
        finalCategoryId = existingCategory.id;
        console.log('Found existing category:', finalCategoryId);
      } else {
        const newCategory = await prisma.foodCategory.create({
          data: { name: customCategory }
        });
        finalCategoryId = newCategory.id;
        console.log('Created new category:', finalCategoryId);
      }
    }

    if (!finalCategoryId) {
      console.error('No category ID provided');
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // Handle restaurant (custom or existing)
    let finalRestaurantId = restaurantId || req.user.restaurantId;
    if (customRestaurant) {
      console.log('Creating/finding custom restaurant:', customRestaurant);
      // Create custom restaurant or find existing
      const existingRestaurant = await prisma.restaurant.findFirst({
        where: { name: customRestaurant }
      });

      if (existingRestaurant) {
        finalRestaurantId = existingRestaurant.id;
        console.log('Found existing restaurant:', finalRestaurantId);
      } else {
        // Create a basic restaurant entry
        const newRestaurant = await prisma.restaurant.create({
          data: {
            name: customRestaurant,
            address: 'To be updated',
            phone: '0000000000',
            openingHours: '09:00',
            closingHours: '22:00',
          }
        });
        finalRestaurantId = newRestaurant.id;
        console.log('Created new restaurant:', finalRestaurantId);
      }
    }

    if (!finalRestaurantId) {
      console.error('No restaurant ID provided');
      return res.status(400).json({
        success: false,
        message: 'Restaurant is required'
      });
    }

    // Prepare food data
    const foodData = {
      name,
      description,
      price: parseFloat(price),
      categoryId: finalCategoryId,
      restaurantId: finalRestaurantId,
      preparationTime: parseInt(preparationTime) || 15,
      isVegetarian: isVegetarian === 'true' || isVegetarian === true,
      isVegan: isVegan === 'true' || isVegan === true,
      isGlutenFree: isGlutenFree === 'true' || isGlutenFree === true,
      spicyLevel: spicyLevel || 'NONE',
      status: 'PENDING', // Pending admin approval
      submittedBy: chefId,
      isAvailable: false, // Not available until approved
    };

    // Add image path if uploaded, or use URL
    if (req.file) {
      foodData.image = `/uploads/foods/${req.file.filename}`;
    } else if (imageUrl) {
      foodData.image = imageUrl;
    }

    console.log('Creating food with data:', foodData);

    // Create food item
    const food = await prisma.food.create({
      data: foodData,
      include: {
        category: true,
        restaurant: true,
        submitter: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    console.log('Food created successfully:', food.id);

    res.status(201).json({
      success: true,
      message: 'Food submitted successfully! Waiting for admin approval.',
      data: food
    });
  } catch (error) {
    console.error('=== Error submitting food ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to submit food',
      error: error.message
    });
  }
};

/**
 * Get all foods submitted by the chef
 */
const getChefSubmittedFoods = async (req, res) => {
  try {
    const chefId = req.user.id;

    const foods = await prisma.food.findMany({
      where: {
        submittedBy: chefId
      },
      include: {
        category: true,
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Error fetching submitted foods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submitted foods',
      error: error.message
    });
  }
};

/**
 * Get orders for chef's restaurant
 */
const getChefOrders = async (req, res) => {
  try {
    const chef = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { restaurantId: true }
    });

    if (!chef.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Chef is not assigned to any restaurant'
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: chef.restaurantId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE']
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        items: {
          include: {
            food: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
          }
        },
        deliveryAddress: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching chef orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Update order status (Chef operations)
 */
const updateChefOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status transitions for chef
    const validChefStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'READY_TO_SERVE'];
    if (!validChefStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status for chef operation'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        items: {
          include: {
            food: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
          }
        },
      }
    });

    // Create notification for status change
    const statusMessages = {
      CONFIRMED: 'Your order has been accepted by the chef',
      PREPARING: 'Your order is being prepared',
      READY: 'Your order is ready for pickup',
      READY_TO_SERVE: 'Your order is ready to be served',
    };

    try {
      await prisma.notification.create({
        data: {
          userId: order.customerId,
          title: 'Order Status Update',
          message: statusMessages[status] || `Order status updated to ${status}`,
          type: 'ORDER_UPDATE',
          relatedId: order.id,
        }
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Continue even if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * Get chef dashboard statistics
 */
const getChefStats = async (req, res) => {
  try {
    const chef = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { restaurantId: true }
    });

    if (!chef.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Chef is not assigned to any restaurant'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get order statistics
    const [
      pendingOrders,
      preparingOrders,
      completedTodayOrders,
      totalTodayOrders,
      submittedFoods,
      approvedFoods
    ] = await Promise.all([
      prisma.order.count({
        where: {
          restaurantId: chef.restaurantId,
          status: 'PENDING'
        }
      }),
      prisma.order.count({
        where: {
          restaurantId: chef.restaurantId,
          status: {
            in: ['CONFIRMED', 'PREPARING']
          }
        }
      }),
      prisma.order.count({
        where: {
          restaurantId: chef.restaurantId,
          status: {
            in: ['DELIVERED', 'SERVED', 'COMPLETED']
          },
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.order.count({
        where: {
          restaurantId: chef.restaurantId,
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.food.count({
        where: {
          submittedBy: req.user.id,
          status: 'PENDING'
        }
      }),
      prisma.food.count({
        where: {
          submittedBy: req.user.id,
          status: 'APPROVED'
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders: {
          pending: pendingOrders,
          preparing: preparingOrders,
          completedToday: completedTodayOrders,
          totalToday: totalTodayOrders,
        },
        foods: {
          submitted: submittedFoods,
          approved: approvedFoods,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chef stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  submitFood,
  getChefSubmittedFoods,
  getChefOrders,
  updateChefOrderStatus,
  getChefStats,
};
