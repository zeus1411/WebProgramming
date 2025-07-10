import knexObj from 'knex';

const knex = knexObj({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1', //host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'webupdate'
  },
  pool: { min: 0, max: 7 }
});

export default knex;