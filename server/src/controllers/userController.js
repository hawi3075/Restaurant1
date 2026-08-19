const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        restaurantId: true,
        restaurant: {
          select: { id: true, name: true, address: true }
        },
        addresses: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all customers (Admin only)
const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all staff (Admin only)
const getAllStaff = async (req, res) => {
  try {
    const { role } = req.query;

    const filters = {
      role: role ? role : { in: ['CHEF', 'WAITER', 'DRIVER'] }
    };

    const staff = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        restaurantId: true,
        restaurant: { select: { name: true } },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Create staff member (Admin only)
const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role, restaurantId } = req.body;

    if (!name || !email || !password || !role || !restaurantId) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    if (!['CHEF', 'WAITER', 'DRIVER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid staff role.' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        restaurantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        restaurantId: true
      }
    });

    res.status(201).json({ message: 'Staff member created successfully', staff });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete staff member (Admin only)
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    if (user.role === 'ADMIN' || user.role === 'CUSTOMER') {
      return res.status(400).json({ error: 'Cannot delete admin or customer users through this endpoint.' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Add user address
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, fullAddress, latitude, longitude } = req.body;

    if (!title || !fullAddress) {
      return res.status(400).json({ error: 'Please provide title and full address.' });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        title,
        fullAddress,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get user addresses
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { id: 'desc' }
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { 
  getProfile, 
  updateProfile, 
  getAllCustomers, 
  getAllStaff, 
  createStaff, 
  deleteStaff,
  addAddress,
  getAddresses
};
