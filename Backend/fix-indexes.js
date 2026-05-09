const db = require('./models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to MySQL');

    // Drop ALL non-primary foreign keys from candidate table
    const [fks] = await db.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'candidate' 
        AND TABLE_SCHEMA = 'Hirex' 
        AND CONSTRAINT_NAME != 'PRIMARY'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log(`Found ${fks.length} foreign keys to drop`);

    for (const fk of fks) {
      try {
        await db.sequelize.query(`ALTER TABLE candidate DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        console.log(`  Dropped FK: ${fk.CONSTRAINT_NAME}`);
      } catch (e) {
        // Already dropped
      }
    }

    // Drop ALL non-primary indexes
    const [indexes] = await db.sequelize.query(`SHOW INDEX FROM candidate`);
    const indexNames = [...new Set(indexes.map(i => i.Key_name).filter(k => k !== 'PRIMARY'))];
    console.log(`Found ${indexNames.length} indexes to drop`);

    for (const name of indexNames) {
      try {
        await db.sequelize.query(`ALTER TABLE candidate DROP INDEX \`${name}\``);
        console.log(`  Dropped index: ${name}`);
      } catch (e) {
        // Already dropped
      }
    }

    console.log('\n✅ Cleaned candidate table indexes');
    
    // Now sync safely
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
