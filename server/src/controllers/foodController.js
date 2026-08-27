const prisma = require('../config/prisma');

// Get all food categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.foodCategory.findMany({
      include: {
        _count: { select: { foods: true } }
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error while fetching categories.' });
  }
};

// Create a food category (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const category = await prisma.foodCategory.create({
      data: { name, image }
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get foods (with optional filters by category, restaurant, or search query)
const getFoods = async (req, res) => {
  try {
    const { categoryId, restaurantId, search, popular } = req.query;
    
    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (restaurantId) filters.restaurantId = restaurantId;
    if (popular === 'true') filters.isPopular = true;
    if (search) {
      filters.name = { contains: search, mode: 'insensitive' };
    }

    const foods = await prisma.food.findMany({
      where: filters,
      include: {
        category: true,
        restaurant: { select: { id: true, name: true, address: true } },
        addons: true,
        reviews: true
      }
    });

    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Internal server error while fetching foods.' });
  }
};

// Get single food details
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        category: true,
        restaurant: true,
        addons: true,
        reviews: {
          include: { customer: { select: { name: true } } }
        }
      }
    });

    if (!food) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    res.json(food);
  } catch (error) {
    console.error('Error fetching food details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Add new food item (Admin / Restaurant Owner)
const createFood = async (req, res) => {
  try {
    const { name, description, price, image, categoryId, restaurantId, isPopular, addons } = req.body;

    if (!name || !price || !categoryId || !restaurantId) {
      return res.status(400).json({ error: 'Please provide name, price, category, and restaurant.' });
    }

    const food = await prisma.food.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId,
        restaurantId,
        isPopular: isPopular || false,
        addons: addons ? {
          create: addons.map(addon => ({ name: addon.name, price: parseFloat(addon.price) }))
        } : undefined
      },
      include: { addons: true }
    });

    res.status(201).json({ message: 'Food item created successfully', food });
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ error: 'Internal server error during food creation.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    const category = await prisma.foodCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(image !== undefined && { image })
      }
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error during category update.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const foods = await tx.food.findMany({
        where: { categoryId: id },
        select: { id: true }
      });
      const foodIds = foods.map(f => f.id);

      if (foodIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { foodId: { in: foodIds } }
        });
        await tx.review.deleteMany({
          where: { foodId: { in: foodIds } }
        });
        await tx.foodAddon.deleteMany({
          where: { foodId: { in: foodIds } }
        });
        await tx.food.deleteMany({
          where: { categoryId: id }
        });
      }
      await tx.foodCategory.delete({
        where: { id }
      });
    });
    res.json({ message: 'Category and all associated foods deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error during category deletion.' });
  }
};

const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, restaurantId, isPopular, isAvailable } = req.body;

    const food = await prisma.food.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(image !== undefined && { image }),
        ...(categoryId && { categoryId }),
        ...(restaurantId && { restaurantId }),
        ...(isPopular !== undefined && { isPopular }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

    res.json(food);
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({ error: 'Internal server error during food update.' });
  }
};

const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { foodId: id } });
      await tx.review.deleteMany({ where: { foodId: id } });
      await tx.foodAddon.deleteMany({ where: { foodId: id } });
      await tx.food.delete({ where: { id } });
    });
    res.json({ message: 'Food item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Internal server error during food deletion.' });
  }
};

const getAddons = async (req, res) => {
  try {
    const addons = await prisma.foodAddon.findMany({
      include: {
        food: {
          select: {
            name: true,
            restaurant: { select: { name: true } }
          }
        }
      }
    });
    res.json(addons);
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createAddon = async (req, res) => {
  try {
    const { name, price, foodId } = req.body;
    if (!name || !price || !foodId) {
      return res.status(400).json({ error: 'Name, price, and foodId are required.' });
    }
    const addon = await prisma.foodAddon.create({
      data: {
        name,
        price: parseFloat(price),
        foodId
      },
      include: {
        food: {
          select: {
            name: true,
            restaurant: { select: { name: true } }
          }
        }
      }
    });
    res.status(201).json(addon);
  } catch (error) {
    console.error('Error creating addon:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, foodId } = req.body;
    const addon = await prisma.foodAddon.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(foodId && { foodId })
      },
      include: {
        food: {
          select: {
            name: true,
            restaurant: { select: { name: true } }
          }
        }
      }
    });
    res.json(addon);
  } catch (error) {
    console.error('Error updating addon:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteAddon = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.foodAddon.delete({
      where: { id }
    });
    res.json({ message: 'Addon deleted successfully.' });
  } catch (error) {
    console.error('Error deleting addon:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { 
  getCategories, 
  createCategory, 
  getFoods, 
  getFoodById, 
  createFood,
  updateCategory,
  deleteCategory,
  updateFood,
  deleteFood,
  getAddons,
  createAddon,
  updateAddon,
  deleteAddon
};