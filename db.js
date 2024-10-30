import mysql from 'mysql2/promise';
const pool=mysql.createPool({
   host: 'localhost', // địa chỉ host của mysql dưới local
   user: 'root', // tên người dùng 
   password:'123456', // password của người dùng
   database: 'node44', // tên database
   port:3307
});

export default pool;