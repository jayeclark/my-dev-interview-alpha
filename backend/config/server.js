const vars = process.env;
let PORT = 1337;
if (vars.PORT) { PORT = vars.PORT }
console.log(PORT)
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', PORT),
  url: env('URL', `http://0.0.0.0:${PORT}`),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
