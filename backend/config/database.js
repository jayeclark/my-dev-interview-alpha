const vars = process.env;
let DB_HOST;
let DB_PORT;
let DB_NAME;
let DB_USERNAME;
let DB_PASSWORD;
if (vars.DATABASE_URL) {
  const [userAndPword, hostPortDb] = vars.DATABASE_URL?.replace("postgres://", "").split("@");
  const [username, password] = userAndPword.split(":");
  const [hostAndPort, db] = hostPortDb.split("/");
  const [host, port] = hostAndPort.split(":");
  DB_HOST = host;
  DB_PORT = port;
  DB_NAME = db;
  DB_USERNAME = username;
  DB_PASSWORD = password;
}

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', DB_HOST || vars.DATABASE_HOST),
      port: env.int('DATABASE_PORT', DB_PORT || vars.DATABASE_PORT),
      database: env('DATABASE_NAME', DB_NAME || vars.DATABASE_NAME),
      user: env('DATABASE_USERNAME', DB_USERNAME || vars.DATABASE_USERNAME),
      password: env('DATABASE_PASSWORD', DB_PASSWORD || vars.DATABASE_PASSWORD),
      ssl: { rejectUnauthorized: env.bool('DATABASE_SSL', false) },
    },
  },
});
