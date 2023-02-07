const vars = process.env;
let URL = 'http://localhost:1337'
let PORT = 1337
if (vars.PUBLIC_URL) {
  URL = vars.PUBLIC_URL
  PORT = vars.PORT
}
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', PORT),
  url: env('PUBLIC_URL', URL),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
