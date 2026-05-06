const db = require("./models");

async function syncDB() {
  try {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.sequelize.sync({ force: true });
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Database synced successfully");
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync database:", err);
    process.exit(1);
  }
}

syncDB();
