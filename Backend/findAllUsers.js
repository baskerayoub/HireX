const db = require('./models');

async function findAllUsers() {
  try {
    const users = await db.users.findAll();
    users.forEach(u => {
      console.log(`Email: ${u.email}, Role: ${u.role}, Password: ${u.password}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

findAllUsers();
