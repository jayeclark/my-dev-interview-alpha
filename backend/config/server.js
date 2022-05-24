const vars = process.env;
let HOST = '0.0.0.0';
let PORT = 1337;
let URL = 'http://localhost:1337';
if (vars.PUBLIC_URL) { URL = vars.PUBLIC_URL }
if (vars.PORT) { PORT = vars.PORT }
if (vars.HOST) { HOST = vars.HOST }

module.exports = ({ env }) => ({
  host: env('HOST', HOST),
  port: env.int('PORT', PORT),
  url: env('URL', URL),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
