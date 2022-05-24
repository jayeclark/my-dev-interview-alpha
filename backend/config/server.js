const vars = process.env;
if (vars.PUBLIC_URL) { URL = vars.PUBLIC_URL}
console.log(PORT)
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', URL),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
