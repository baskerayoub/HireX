const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Hirex",
});

module.exports = db;

if (require.main === module) {
  const express = require("express");
  const loginRoutes = require("./login");

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(loginRoutes);

  db.connect((err) => {
    if (err) {
      console.log("MySQL connection error:", err.message);
      return;
    }

    console.log("MySQL connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
