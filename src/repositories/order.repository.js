const db = require("../models");
const Sequelize = require('sequelize');
const Order = db.Order;


class OrderRepository {
    async create(cart) {
      return await Order.create(cart);
    }
  
    async findByUserIdAndIsOrdered(userId, isOrdered) {
      return await Order.findAll({ where: { userId: userId,
        isOrdered : isOrdered }});
    }

    async findByUserIdAndIsOrderedSortDesc(userId, isOrdered) {
        return await Order.findAll({
            where: {
                userId: userId,
                isOrdered: isOrdered
            },
            include: ['items'] ,
            order: [['updatedAt', 'DESC']] 
        })
    }
  
    async findOrderData(code, userId, itemId) {
      return await Order.findOne({
        where : { code : code,
          userId : userId,
          itemId : itemId
        }
      });
    }

    async findAllByCode(code) {
        return await Order.findAll({
          where : { code : code }
        });
      }

      async findByDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // Set time to 23:59:59.999
    
        return await Order.findAll({
            where: {
                updatedAt: {
                    [Sequelize.Op.between]: [startOfDay, endOfDay]
                }
            },
            include: ['items']
        });
    }
    

    async updateQuantity(code, userId, itemId, quantity) {
        return await Order.update ({ quantity: quantity }, { where: { code, userId, itemId } });
    }

    async updateStatus(code, isOrdered) {
        return await Order.update ({ isOrdered : isOrdered },  { where: { code} });
    }
  

    async delete(code, itemId, isOrdered ) {
      return await Order.destroy({ where: { code, itemId, isOrdered } });
    }

  }
  
  module.exports = new OrderRepository();
  