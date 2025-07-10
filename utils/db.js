import knexObj from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const isRailway = !!process.env.MYSQL_PUBLIC_URL;

let connection;
if (isRailway) {
  // Railway connection string (preferred for production)
  connection = process.env.MYSQL_PUBLIC_URL;
} else {
  // Local development fallback
  connection = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT) : 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'webupdate',
  };
}

const knex = knexObj({
  client: 'mysql2',
  connection,
  pool: { min: 0, max: 7 }
});

export default knex;