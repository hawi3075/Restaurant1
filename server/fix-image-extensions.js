const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImageExtensions() {
  console.log('Starting to fix image extensions...');

  try {
    // Update Food images
    const foods = await prisma.food.findMany();
    for (const food of foods) {
      if (food.image && food.image.endsWith('.jpg')) {
        const newImage = food.image.replace('.jpg', '.webp');
        await prisma.food.update({
          where: { id: food.id },
          data: { image: newImage }
        });
        console.log(`Updated food ${food.name}: ${food.image} → ${newImage}`);
      }
    }

    // Update Restaurant logos and cover images
    const restaurants = await prisma.restaurant.findMany();
    for (const restaurant of restaurants) {
      const updates = {};
      if (restaurant.logo && restaurant.logo.endsWith('.jpg')) {
        updates.logo = restaurant.logo.replace('.jpg', '.webp');
      }
      if (restaurant.coverImage && restaurant.coverImage.endsWith('.jpg')) {
        updates.coverImage = restaurant.coverImage.replace('.jpg', '.webp');
      }
      if (Object.keys(updates).length > 0) {
        await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: updates
        });
        console.log(`Updated restaurant ${restaurant.name}`);
      }
    }

    // Update Category images
    const categories = await prisma.foodCategory.findMany();
    for (const category of categories) {
      if (category.image && category.image.endsWith('.jpg')) {
        const newImage = category.image.replace('.jpg', '.webp');
        await prisma.foodCategory.update({
          where: { id: category.id },
          data: { image: newImage }
        });
        console.log(`Updated category ${category.name}: ${category.image} → ${newImage}`);
      }
    }

    console.log('✅ All image extensions fixed!');
  } catch (error) {
    console.error('Error fixing image extensions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageExtensions();
