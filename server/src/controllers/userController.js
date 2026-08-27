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

    const primaryAddress = user.addresses && user.addresses.length > 0
      ? user.addresses[user.addresses.length - 1].fullAddress
      : '';

    res.json({
      ...user,
      address: primaryAddress
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    const updateData = {};
    if (name !== undefined && name !== null) updateData.name = name;
    if (phone !== undefined && phone !== null) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
    }

    if (address && typeof address === 'string' && address.trim() !== '') {
      const existingAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { id: 'asc' }
      });

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: { fullAddress: address.trim() }
        });
      } else {
        await prisma.address.create({
          data: {
            userId,
            title: 'Home',
            fullAddress: address.trim()
          }
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        restaurantId: true,
        addresses: true
      }
    });

    const primaryAddress = updatedUser.addresses && updatedUser.addresses.length > 0
      ? updatedUser.addresses[updatedUser.addresses.length - 1].fullAddress
      : '';

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        address: primaryAddress
      }
    });
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

// Delete customer (Admin only)
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    if (user.role !== 'CUSTOMER') {
      return res.status(400).json({ error: 'This endpoint can only delete customer accounts.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete reviews written by this customer
      await tx.review.deleteMany({ where: { customerId: id } });

      // 2. Delete payments, order items, status history for this customer's orders
      const orders = await tx.order.findMany({
        where: { customerId: id },
        select: { id: true }
      });
      const orderIds = orders.map((o) => o.id);

      if (orderIds.length > 0) {
        await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.order.deleteMany({ where: { customerId: id } });
      }

      // 3. Delete this customer's saved addresses
      await tx.address.deleteMany({ where: { userId: id } });

      // 4. Delete the customer account itself
      await tx.user.delete({ where: { id } });
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Add user address
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, fullAddress, address, latitude, longitude } = req.body;
    const finalAddress = fullAddress || address;

    if (!title || !finalAddress) {
      return res.status(400).json({ error: 'Please provide title and address.' });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        title,
        fullAddress: finalAddress,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      }
    });

    res.status(201).json({ message: 'Address added successfully', address: newAddress });
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

// Update user address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, fullAddress, address, latitude, longitude } = req.body;
    const finalAddress = fullAddress || address;

    const addressRecord = await prisma.address.findUnique({ where: { id } });
    if (!addressRecord) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    if (addressRecord.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this address.' });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(finalAddress && { fullAddress: finalAddress }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null })
      }
    });

    res.json({ message: 'Address updated successfully', address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete user address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const addressRecord = await prisma.address.findUnique({ where: { id } });
    if (!addressRecord) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    if (addressRecord.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this address.' });
    }

    await prisma.address.delete({ where: { id } });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
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
  deleteCustomer,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
};