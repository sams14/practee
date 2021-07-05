require("dotenv").config();

module.exports = {
  ENV: process.env.APP_ENV,
  URL: process.env.APP_URL,
  DB: process.env.APP_DB,
  PORT: process.env.APP_PORT,
  SECRET: process.env.APP_SECRET,
  USER: process.env.EMAIL_USER,
  PASS: process.env.EMAIL_PASS
};
