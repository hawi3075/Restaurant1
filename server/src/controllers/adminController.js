const prisma = require('../config/prisma');

// --- Zones CRUD ---
const getZones = async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Internal server error while fetching zones.' });
  }
};

const createZone = async (req, res) => {
  try {
    const { name, restaurants, deliveryMen, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Zone name is required.' });
    }
    const zone = await prisma.zone.create({
      data: {
        name,
        restaurants: restaurants ? parseInt(restaurants) : 0,
        deliveryMen: deliveryMen ? parseInt(deliveryMen) : 0,
        status: status || 'Active'
      }
    });
    res.status(201).json(zone);
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({ error: 'Internal server error while creating zone.' });
  }
};

const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, restaurants, deliveryMen, status } = req.body;
    
    const zone = await prisma.zone.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(restaurants !== undefined && { restaurants: parseInt(restaurants) }),
        ...(deliveryMen !== undefined && { deliveryMen: parseInt(deliveryMen) }),
        ...(status && { status })
      }
    });
    res.json(zone);
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({ error: 'Internal server error while updating zone.' });
  }
};

const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.zone.delete({
      where: { id }
    });
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({ error: 'Internal server error while deleting zone.' });
  }
};

// --- Cuisines CRUD ---
const getCuisines = async (req, res) => {
  try {
    const cuisines = await prisma.cuisine.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(cuisines);
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    res.status(500).json({ error: 'Internal server error while fetching cuisines.' });
  }
};

const createCuisine = async (req, res) => {
  try {
    const { name, restaurants, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Cuisine name is required.' });
    }
    const cuisine = await prisma.cuisine.create({
      data: {
        name,
        restaurants: restaurants ? parseInt(restaurants) : 0,
        status: status || 'Active'
      }
    });
    res.status(201).json(cuisine);
  } catch (error) {
    console.error('Error creating cuisine:', error);
    res.status(500).json({ error: 'Internal server error while creating cuisine.' });
  }
};

const updateCuisine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, restaurants, status } = req.body;
    
    const cuisine = await prisma.cuisine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(restaurants !== undefined && { restaurants: parseInt(restaurants) }),
        ...(status && { status })
      }
    });
    res.json(cuisine);
  } catch (error) {
    console.error('Error updating cuisine:', error);
    res.status(500).json({ error: 'Internal server error while updating cuisine.' });
  }
};

const deleteCuisine = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cuisine.delete({
      where: { id }
    });
    res.json({ message: 'Cuisine deleted successfully' });
  } catch (error) {
    console.error('Error deleting cuisine:', error);
    res.status(500).json({ error: 'Internal server error while deleting cuisine.' });
  }
};

// --- Business Settings CRUD ---
const getSettings = async (req, res) => {
  try {
    let settings = await prisma.businessSettings.findFirst();
    if (!settings) {
      // Create a default singleton if it doesn't exist
      settings = await prisma.businessSettings.create({
        data: {}
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error while fetching settings.' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { businessName, supportEmail, supportPhone, currency, deliveryFee, commissionRate } = req.body;
    
    let settings = await prisma.businessSettings.findFirst();
    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          businessName,
          supportEmail,
          supportPhone,
          currency,
          deliveryFee: deliveryFee !== undefined ? parseFloat(deliveryFee) : undefined,
          commissionRate: commissionRate !== undefined ? parseFloat(commissionRate) : undefined
        }
      });
    } else {
      settings = await prisma.businessSettings.update({
        where: { id: settings.id },
        data: {
          ...(businessName && { businessName }),
          ...(supportEmail && { supportEmail }),
          ...(supportPhone && { supportPhone }),
          ...(currency && { currency }),
          ...(deliveryFee !== undefined && { deliveryFee: parseFloat(deliveryFee) }),
          ...(commissionRate !== undefined && { commissionRate: parseFloat(commissionRate) })
        }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error while updating settings.' });
  }
};

module.exports = {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  getCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
  getSettings,
  updateSettings
};
