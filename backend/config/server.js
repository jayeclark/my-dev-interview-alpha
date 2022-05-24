const vars = process.env;
let URL = 'http://localhost:1337'
if (vars.PUBLIC_URL) { URL = vars.PUBLIC_URL}
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', URL),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
