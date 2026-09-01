const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = 'superadmin@maad.com';
    const password = 'SuperAdmin@2024';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user to SUPER_ADMIN
      const updated = await prisma.user.update({
        where: { email },
        data: { 
          role: 'SUPER_ADMIN',
          password: hashedPassword 
        }
      });
      console.log('✅ Existing user updated to SUPER_ADMIN!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 Name:', updated.name);
    } else {
      // Create new super admin
      const newUser = await prisma.user.create({
        data: {
          name: 'Super Administrator',
          email: email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          phone: '+251 900 000 000'
        }
      });
      console.log('✅ Super Admin account created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 Name:', newUser.name);
    }

    console.log('\n🚀 You can now login at: http://localhost:5173/login');
    console.log('🎯 You will be redirected to: /superadmin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
