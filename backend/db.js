<<<<<<< HEAD
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "queuesmart",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
=======
module.exports = require("./config/db");
>>>>>>> caa73df8293832b78ef972684fb580ea7f2c9cdd
