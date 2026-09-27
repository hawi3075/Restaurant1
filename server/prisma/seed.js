const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Checking database state...');

  const existingRestaurants = await prisma.restaurant.count();
  const existingCategories = await prisma.foodCategory.count();
  const existingFoods = await prisma.food.count();

  console.log('📊 Current data count:');
  console.log('  - Restaurants:', existingRestaurants);
  console.log('  - Categories:', existingCategories);
  console.log('  - Foods:', existingFoods);

  const shouldClearAndReseed = existingRestaurants === 0 && existingCategories === 0 && existingFoods === 0;

  if (!shouldClearAndReseed) {
    console.log('🛑 Database already has data. Seed script will NOT run. No changes made.');
    return;
  }

  console.log('🗑️  Database is empty, performing full seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@maad.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@maad.com',
      password: hashedPassword,
      phone: '+251900000000',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@maad.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@maad.com',
      password: hashedPassword,
      phone: '+251911234567',
      role: 'ADMIN',
    },
  });

  console.log('✅ Minimal seed complete (admin accounts only). Add real restaurants/foods via the admin dashboard.');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });