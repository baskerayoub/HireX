const db = require('./models');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await db.users.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@hirex.com',
      password: hashedPassword,
      role: 'Admin',
      status: 'Active',
      joinDate: new Date(),
      must_change_password: false,
    });
    console.log('Admin created: admin@hirex.com / Admin123!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

createAdmin();
