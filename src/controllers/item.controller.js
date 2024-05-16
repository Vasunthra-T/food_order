const { where } = require("sequelize");
const db = require("../models");
const Item = db.Item;
const Op = db.sequelize.Op;

exports.create = ({ body: { name, description, price } }, res) => {
  // Save item in the database
  Item.create({ name, description, price })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error while creating an item:" + err
      });
    });
};

  
  exports.findAll = (req,res) => {
    Item.findAll()
      .then(items => {
        res.send(items);
    })
    .catch(error => {
        console.error('Error fetching items:', error);
    });
  };


  exports.findItemById = (req,res) => {
    const id = req.params.id;
    Item.findByPk(id)
        .then(data => {
            if(!data){
                return res.status(404).send({
                    message: "No item found"
                });
            }
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error fetching item details with id" + id
            });
        });
   };


   exports.updateItemById = (req, res) => {
    const id = req.params.id;

    Item.update(req.body, {
        where : {id: id}
    })
      .then(() => {
        res.send({
            message : "Item details updated successfully"
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating an item."
        });
      });
  };


  exports.deleteItemById = (req, res) => {
    const id = req.params.id;

    Item.destroy({
        where : {id: id}
    })
    .then(num => {
        if(num == 1){
            res.send({
                message : "Item deleted successfully"
            });
        }
        else{
            res.status(404).send({
                message : "Item not found"
            });
        }
        
    })
    .catch(err => {
        res.status(500).send({
            message:
              err.message || "Some error occurred while deleting an item."
          });
    });
  };


  exports.deleteAll = (req, res) => {
    Item.truncate()
    .then(() => {
        res.send({
            message : "Items deleted successfully"
        }); 
    })
    .catch(err => {
        res.status(500).send({
            message:
              err.message || "Some error occurred while deleting items"
          });
    });
  };