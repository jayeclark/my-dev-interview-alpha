const vars = process.env;
let PORT = 1337;
let URL = 'http://localhost:1337'
if (vars.PORT) { PORT = vars.PORT }
if (vars.PUBLIC_URL) { URL = vars.PUBLIC_URL}
console.log(PORT)
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', PORT),
  url: env('', URL),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
