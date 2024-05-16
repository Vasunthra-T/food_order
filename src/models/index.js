const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config.js')

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  dialect: dbConfig.DIALECT,
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  schema: 'public',
});

const Item = require('./item')(sequelize, Sequelize);
const Order = require('./order')(sequelize, Sequelize);
const User = require('./user')(sequelize, Sequelize);

// Define associations
Order.belongsTo(User, { foreignKey: 'userId',  as: "users" }); // Each order belongs to a user
Order.belongsTo(Item, { foreignKey: 'itemId',  as: "items" }); // Each order belongs to an item

User.hasMany(Order, { foreignKey: 'userId' }); // A user can have many orders
Item.hasMany(Order, { foreignKey: 'itemId' }); // An item can be part of many orders

module.exports = {
  Item,
  Order,
  User,
  sequelize,
};
