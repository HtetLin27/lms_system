import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import config from './config.js';
dotenv.config();

export const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: config.app.isDev ? console.log : false,

  pool: {
    // Why connection pool:
    // Instead of opening and closing a database connection on every request
    // (slow), Sequelize keeps a pool of open connections and reuses them.
    // max: 10 means at most 10 simultaneous database connections.
    max: 10,
    min: 0,
    acquire: 30000, // max time (ms) to get a connection from the pool before throwing error
    idle: 10000, // max time (ms) a connection can be idle before being released
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB Connection has been established successfully.');
  } catch (error) {
    const message =
      error.errors
        ?.map((err) => err.message)
        .filter(Boolean)
        .join('; ') ||
      error.parent?.message ||
      error.cause?.message ||
      error.message ||
      error.name;

    throw new Error(`Unable to connect to the database: ${message}`);
  }
};

export default connectDB;
