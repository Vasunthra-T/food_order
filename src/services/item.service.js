const itemRepository = require("../repositories/item.repository");

class ItemService {
  async createItem({ name, description, price }) {
    try {
      return await itemRepository.create({ name, description, price });
    } catch (error) {
      throw new Error("Error while creating an item: " + error.message);
    }
  }

  async getAllItems() {
    try {
      return await itemRepository.findAll();
    } catch (error) {
      throw new Error("Error fetching items: " + error.message);
    }
  }

  async getItemById(id) {
    try {
      const item = await itemRepository.findById(id);
      if (!item) {
        throw new Error("No item found");
      }
      return item;
    } catch (error) {
      throw new Error("Error fetching item details with id " + id + ": " + error.message);
    }
  }

  async updateItemById(id, updatedData) {
    try {
      const item = await itemRepository.findById(id);
      if(item) {
        await itemRepository.update(id, updatedData);
        return { message: "Item details updated successfully" };
      }
      else {
        return { message: "Item not found" };
      }
      
    } catch (error) {
      throw new Error("Error updating item with id " + id + ": " + error.message);
    }
  }

  async deleteItemById(id) {
    try {
      const num = await itemRepository.delete(id);
      if (num === 0) {
        throw new Error("Item not found");
      }
      return { message: "Item deleted successfully" };
    } catch (error) {
      throw new Error("Error deleting item with id " + id + ": " + "Couldn't delete item as it has orders associated with it");
    }
  }

}

module.exports = new ItemService();
