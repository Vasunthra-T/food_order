const db = require("../models");
const Item = db.Item;

class ItemRepository {
  async create({ name, description, price }) {
    return await Item.create({ name, description, price });
  }

  async findAll() {
    return await Item.findAll();
  }

  async findById(id) {
    return await Item.findByPk(id);
  }

  async update(id, updatedData) {
    return await Item.update(updatedData, { where: { id } });
  }

  async delete(id) {
    return await Item.destroy({ where: { id } });
  }

  async deleteAllItems() {
    return await Item.truncate();
  }
}

module.exports = new ItemRepository();
