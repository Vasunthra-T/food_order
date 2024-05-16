const { Queue } = require('bullmq');
const redisModule = require("../common/redis");

const redisClient = redisModule.getRedisClient();

const orderQueue = new Queue('generateOrderReport', { connection: redisClient });

module.exports = {
    orderQueue
};
