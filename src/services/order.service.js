const orderRepository = require("../repositories/order.repository");
const itemRepository = require("../repositories/item.repository");
const userRepository = require("../repositories/user.repository");
const pug = require('pug');
const { createObjectCsvWriter } = require('csv-writer');    

const B2 = require('backblaze-b2');
const fs = require('fs');



const uid = (() => (id = 1, () => id++))();

class OrderService {

    async addItem(item) {
        let cart = {
            itemId : item.itemId,
            userId : item.userId,
            quantity: 1,
            isOrdered: false
        };

        const itemDetails = await itemRepository.findById(item.itemId);
        if(itemDetails) {
            cart.price = itemDetails.price;
        }
        else {
            return { message : "Item doesn't exist"};
        }

        const userDetails = await userRepository.findById(item.userId);
        if(!userDetails) {
            return { message : "User doesn't exist"};
        }
        
        const orderData = await orderRepository.findByUserIdAndIsOrdered(item.userId, false);
        console.log("Data typr: " + typeof orderData);
        if(orderData && orderData.find(order => order.itemId == item.itemId) ){
            return { message: "Item already added to cart" };
        }

        if(orderData && Object.keys(orderData).length === 0 && orderData.constructor === Object) {
            cart.code = orderData.code;
            console.log("Code1:" + cart.code);
        }
        else {
            cart.code = "ORD" + uid();
            console.log("Code2:" + cart.code);
        }

        return await orderRepository.create(cart);          
    }


    async updateQuantity(item) {
        if(item.quantity < 0) {
            return { message : "Enter valid quantity"}; 
        };

        const orderData = orderRepository.findOrderData(item.code, item.userId, item.itemId);
        if(orderData) {
            if(item.quantity == 0) {
                orderRepository.delete(item.code, item.userId, item.itemId);
                return { message : "Item removed from cart" };
            }
            else {
                return await orderRepository.updateQuantity(item.code, item.userId, item.itemId, item.quantity);
            }
        }
    }


    async placeOrder(code) {
        const orders = await orderRepository.findAllByCode(code);
        if(orders) {
            orders.map(order => {
                orderRepository.updateStatus(order.code, true);
              })
            return {message : "Order placed!"};
        }
        else {
            return {message : "Items with the code doesn't exist"};
        }
    }


    async orderHistory(userId) {
        const orderDetails = await orderRepository.findByUserIdAndIsOrderedSortDesc(userId, true);
        if (!orderDetails || typeof orderDetails !== 'object') {
            // Handle the case when no order history is found or the data structure is incorrect
            return [];
        }
    
        let orderHistory = [];
    
        for (const key in orderDetails) {
            if (orderDetails.hasOwnProperty(key)) {
                const order = orderDetails[key];
                let existingOrder = orderHistory.find(item => item.code === order.code);
    
                if (!existingOrder) {
                    existingOrder = {
                        code: order.code,
                        items: []
                    };
                    orderHistory.push(existingOrder);
                }
                existingOrder.items.push({
                    itemName: order.items.name,
                    quantity: order.quantity,
                    price: order.price,
                });
            }
        }
    
        orderHistory.forEach(order => {
            let totalPrice = 0;
            order.items.forEach(item => {
                totalPrice += item.quantity * item.price;
            });
            order.totalPrice = totalPrice;
        });
    
        return orderHistory;
    }
    


    async deleteItem(item) {
        const deletedItem = await orderRepository.delete(item.code, item.itemId, false);
        if(deletedItem === 0) {
            return { message : "Item not found in cart"}
        }
        return { message : "Item removed from cart"};
    }


    async sendOrderDetails(date) {
        try {
            const orders = await orderRepository.findByDate(date);

            let totalProfit = 0;

            const groupedOrders = {};
            orders.forEach(order => {
                const itemId = order.itemId;
                if (!groupedOrders[itemId]) {
                    groupedOrders[itemId] = {
                        item: order.items.name,
                        quantity: 0,
                        totalPrice: 0
                    };
                }
                groupedOrders[itemId].quantity += order.quantity;
                groupedOrders[itemId].totalPrice = order.items.price;
                totalProfit += order.quantity * order.items.price;
            });

            const templatePath = './src/common/table.pug';
            const compiledFunction = pug.compileFile(templatePath);

            const html = compiledFunction({ groupedOrders, totalProfit });

            console.log("Table details:\n" + html);
            return html;
        } catch (error) {
            console.error("Error fetching order details:", error);
            throw error;
        }
    }

    

    async sendOrderDetailsInCsv(date, fileName) {
        try {
            console.log("Filename" + fileName);
            const b2 = new B2({
                applicationKeyId: process.env.APPLICATION_KEY_ID, // or accountId: 'accountId'
                applicationKey: process.env.APPLICATION_KEY // or masterApplicationKey
            });
            
            const orders = await orderRepository.findByDate(date);

            let totalProfit = 0;

            const records = [];
            orders.forEach(order => {
                records.push({
                    item: order.items.name,
                    quantity: order.quantity,
                    totalPrice: order.quantity * order.items.price
                });
                totalProfit += order.quantity * order.items.price;
            });

            const csvWriter = createObjectCsvWriter({
                path: `./${fileName}`,
                header: [
                    { id: 'item', title: 'Item' },
                    { id: 'quantity', title: 'Quantity' },
                    { id: 'totalPrice', title: 'Total Price' }
                ]
            });

            await csvWriter.writeRecords(records);

            await b2.authorize(); 
            const fileData = fs.readFileSync(`./${fileName}`);

            const uploadUrlResponse = await b2.getUploadUrl({ 'bucketId' : process.env.BUCKET_ID });

            const response = await b2.uploadFile({ 
                uploadUrl: uploadUrlResponse.data.uploadUrl,
                uploadAuthToken: uploadUrlResponse.data.authorizationToken,
                fileName: fileName,
                data: fileData,
                bucketName: 'order-details'
            });
            console.log("Response:" + response.data);
            console.log(`CSV file ${fileName}.csv has been written and uploaded successfully.`);
            
            // return response.data.downloadUrl;
        } catch (error) {
            console.error("Error writing order details to CSV:", error);
            throw error;
        }
    }




      
}

module.exports = new OrderService();


