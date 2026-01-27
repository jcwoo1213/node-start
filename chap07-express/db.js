const mysql = require("mysql2/promise");

//pool 커녁션 몇개 받아놓고 필요할때마다 준다
//생성
const pool = mysql.createPool({
  host: "localhost",
  user: "dev01",
  password: "dev01",
  database: "dev",
});

module.exports = pool;
