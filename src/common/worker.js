const orderService = require("../services/order.service.js");
const { orderQueue } = require('../config/bullMqConfig.js'); 
const redisModule = require("../common/redis");
const { Worker } = require('bullmq');

redisModule.initializeRedisClient();

const redisClient = redisModule.getRedisClient();
const worker = new Worker('generateOrderReport', async (job) => {
    const { date, fileName } = job.data;
    try {
        await orderService.sendOrderDetailsInCsv(date, fileName);
    } catch (error) {
        console.error("Error processing order:", error);
        throw error;
    }
}, {
    connection: redisClient
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed with error:`, error);
});
