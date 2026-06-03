const db = require('./models');

async function findAdmin() {
  try {
    const admin = await db.users.findOne({ where: { role: 'Admin' } });
    if (admin) {
      console.log('Admin Email:', admin.email);
      console.log('Admin Password Hash / Plain:', admin.password);
    } else {
      console.log('No admin found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

findAdmin();
