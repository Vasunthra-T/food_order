module.exports = {
    HOST: process.env.POSTGRES_HOST,
    USER: process.env.POSTGRES_USER,
    PASSWORD: process.env.POSTGRES_PASSWORD,
    DB: process.env.POSTGRES_DB,
    DIALECT: "postgres",
    PORT: process.env.POSTGRES_PORT
  };