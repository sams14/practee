require("dotenv").config();

module.exports = {
  ENV: process.env.APP_ENV,
  DB: process.env.APP_DB,
  PORT: process.env.APP_PORT,
  SECRET: process.env.APP_SECRET
};
