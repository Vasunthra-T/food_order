module.exports = app => {
    const itemService = require("../services/item.service.js");
    const validate = require("../validations/item.validation.js")
  
    let router = require("express").Router();

    // Create a new item
    router.post("/", validate.itemValidation, async (req, res) => {
      try {
        const { name, description, price } = req.body;
        const newItem = await itemService.createItem({ name, description, price });
        res.status(200).json(newItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    // Get all items
    router.get("/", async (_req, res) => {
      try {
        let items = await itemService.getAllItems();
        res.status(200).send(items);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get item by id
    router.get("/:id", async (req, res) => {
      try {
        const item = await itemService.getItemById(req.params.id);
        res.status(200).json(item);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }

    });

    // Update item by id
    router.put("/:id", validate.itemValidation, async (req, res) => {
      try {
        const reqData = {
          name : req.body.name,
          description : req.body.description,
          price : req.body.price
        }
        const updatedItem = await itemService.updateItemById(req.params.id, reqData);
        res.status(200).json(updatedItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Delete item by id
    router.delete("/:id", async (req, res) => {
      try {
      const deletedItem  = await itemService.deleteItemById(req.params.id);
      res.status(200).json(deletedItem);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    // Delete all items
    // router.delete("/", item.deleteAll);
  
    app.use("/api/items", router);
  };