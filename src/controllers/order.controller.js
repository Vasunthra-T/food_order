const { where } = require("sequelize");
const db = require("../models");
const Order = db.Order;
const Item = db.Item;

const uid = (() => (id = 1, () => id++))();


exports.addItem = (req, res) => {
  let cart = {
    itemId : req.body.itemId,
    userId : req.body.userId,
    quantity: 1,
    price: req.body.price,
    isOrdered: false
  };

  Item.findByPk(req.body.itemId)
    .then(item => {
      cart.price = item.price
    })
    
  Order.findOne({ where: { userId: req.body.userId,
        isOrdered : false }})
        .then(orderData => {
          if(orderData && orderData.itemId == req.body.itemId){
            return res.send("Item already added to cart");
          };
          
          if(orderData) {
            console.log("IF CASE..");
            cart.orderId = orderData.orderId;
          }
          else {
            console.log("ELSE CASE.." + lastOrderId);
            cart.orderId = "ORD" + uid();
          }

          // Save cart item in the database
          Order.create(cart)
            .then(data => {
              console.log(data.orderId);
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while adding an item"
              });
            });
          }
        )    
};


exports.findOrderByUserId = (req, res) => {
    db.Order.findAll({
        where: { userId: req.params.id },
        include: [ "items", "users" ] 
    })
        .then(orders => {
            console.log("Entered!!!!!!");
            
            const simplifiedValues = orders.map(order => {
              console.log(order.itemId);
              console.log("userId: " + order.userId);
              console.log("quantity:" + order.quantity);
              const simplifiedOrder = {
                  orderId: order.id,
                  quantity: order.quantity,
                  price: order.price * order.quantity,
                  userName: order.users.name,
                  itemName: order.items.name 
              };        
    
              return simplifiedOrder;
          });
            res.send(simplifiedValues);
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            res.status(500).send('Error fetching order details');
        });
};


exports.updateQuantity = (req, res) => {
  if(req.body.quantity < 0) {
    res.send( 'Enter valid quantity')
  };
  db.Order.findOne({
    where : {orderId : req.body.orderId,
      userId : req.body.userId,
      itemId : req.body.itemId
    }
  })
  .then(orders => {
    if(req.body.quantity == 0){
      orders.destroy();
      res.send('Item removed from cart')
    }
    else {
      console.log("Order id:" + orders.orderId);
      console.log("Quantity:" + orders.quantity);
      orders.update ({ quantity : req.body.quantity});
      orders.save();
      res.send('Quantity updated')
    }
    
  })
  .catch(error => {
    res.status(500).send('Error updating order details' + error);
  });
};


exports.placeOrder = (req,res) => {
  Order.findAll({
    where : { orderId: req.body.orderId
    }
  })
  .then(orders => {
    orders.map(order => {
      order.update ({ isOrdered : true });
    })
    res.send('Order placed!');
  })
  .catch(error => {
    res.status(500).send('Error while placing order' + error);
  })
};


exports.orderHistory = (req, res) => {
  Order.findAll({
      where: {
          userId: req.params.id,
          isOrdered: true
      },
      include: ['items'] ,
      order: [['updatedAt', 'DESC']] // Sorting by updatedAt in descending order
  })
  .then(orders => {
      let orderHistory = []; 

      orders.forEach(order => {
          let existingOrder = orderHistory.find(item => item.orderId === order.orderId);

          if (!existingOrder) {
              existingOrder = {
                  orderId: order.orderId,
                  items: [] 
              };
              orderHistory.push(existingOrder);
          }
          existingOrder.items.push({
              itemName: order.items.name,
              quantity: order.quantity,
              price: order.price,
          });
          existingOrder.totalPrice = 0;
      });

      orderHistory.forEach(order => {
        let totalPrice = 0;
        order.items.forEach(item => {
          totalPrice += item.quantity * item.price;
        })
        order.totalPrice = totalPrice;
      })

      res.send(orderHistory);
  })
  .catch(error => {
      console.error('Error fetching order history:', error);
      res.status(500).send('Error fetching order history');
  });
};


exports.deleteItem = (req, res) => {
  Order.destroy({
    where : {
      orderId : req.body.orderId,
      userId : req.body.userId,
      itemId : req.body.itemId,
      isOrdered : false
    }
  })
  .then(orders => {
    res.send('Item deleted successfully');
  })
  .catch(error => {
    res.status(500).send('Error while deleting cart item' + error);
  })
};

