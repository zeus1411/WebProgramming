import knexObj from 'knex';

const knex = knexObj({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1', //host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'webUpdate'
  },
  pool: { min: 0, max: 7 }
});

export default knex;