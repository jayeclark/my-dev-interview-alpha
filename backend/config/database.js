const vars = process.env;

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', vars.DATABASE_HOST),
      port: env.int('DATABASE_PORT', vars.DATABASE_PORT),
      database: env('DATABASE_NAME', vars.DATABASE_NAME),
      user: env('DATABASE_USERNAME', vars.DATABASE_USERNAME),
      password: env('DATABASE_PASSWORD', vars.DATABASE_PASSWORD),
      ssl: env.bool('DATABASE_SSL', vars.DATABASE_SSL),
    },
  },
});
