module.exports = app => {
  const orderService = require("../services/order.service.js");
  const { orderQueue } = require('../config/bullMqConfig.js'); 

  
    let router = require("express").Router();

    // Add an item
    router.post("/", async (req, res) => {
      try {
        const item = {
          userId : req.body.userId,
          itemId : req.body.itemId
        }
        const cartItem = await orderService.addItem(item);
        res.status(200).json(cartItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }     
    });

    // Get order by userId
    // router.get("/:id", function () { order.findOrderByUserId() } );

    // Update quantity
    router.put("/", async (req, res) => {
      try {
        const item = {
          userId : req.body.userId,
          itemId : req.body.itemId,
          code : req.body.code,
          quantity : req.body.quantity
        }
        const updatedItem = await orderService.updateQuantity(item);
        res.status(200).json(updatedItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Place order
    router.put("/placeOrder/:id", async (req, res) => {
      try {
        const orderedItem = await orderService.placeOrder(req.params.id);
        res.status(200).json(orderedItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    //Get order history
    router.get("/orderHistory/:id", async (req, res) => {
      try {
        const orderHistory = await orderService.orderHistory(req.params.id);
        res.status(200).send(orderHistory);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Delete cart item
    router.delete("/", async (req, res) => {
      try {
        const item  = {
          itemId : req.body.itemId,
          code : req.body.code
        }
        const deletedItem = await orderService.deleteItem(item);
        res.status(200).send(deletedItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    //send order details via mail (scheduler)
    router.get("/sendOrderDetails", async (req, res) => {
      try {
        let d = new Date();
        d.setDate(d.getDate() - 1);
        const formattedDate = d.toISOString().split('T')[0];

        await orderService.sendOrderDetails(formattedDate);
        res.status(200).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    })


    //get order details in csv and uplaod it to backblaze
    router.get("/getOrderDetails", async (req, res) => {
      try {
          const  name  = req.query.fileName;
          let d = new Date();
          d.setDate(d.getDate() - 1);
          const formattedDate = d.toISOString().split('T')[0];
  
          const fileName = `${name}.csv`;
  
          await orderQueue.add('generateOrderReport', { date: formattedDate, fileName }, { delay : 5000});
  
          res.status(200).json({ message: `Order for ${name} has been queued.`, fileName });
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  });


  
    app.use("/api/orders", router);
  };