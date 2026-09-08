const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('\n=== Checking Food Images ===\n');
    
    const foods = await prisma.food.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    foods.forEach(food => {
      console.log(`ID: ${food.id}`);
      console.log(`Name: ${food.name}`);
      console.log(`Image: ${food.image}`);
      console.log(`Image Type: ${typeof food.image}`);
      console.log(`---`);
    });

    console.log('\n=== Checking Restaurant Images ===\n');
    
    const restaurants = await prisma.restaurant.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        logo: true,
        coverImage: true
      }
    });

    restaurants.forEach(rest => {
      console.log(`ID: ${rest.id}`);
      console.log(`Name: ${rest.name}`);
      console.log(`Logo: ${rest.logo}`);
      console.log(`Cover: ${rest.coverImage}`);
      console.log(`---`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
