const { createClient } = require("redis-promisify");
const Redis = require('ioredis');

let redisClient;

const initializeRedisClient = () => {
    let redisURL = process.env.REDIS_URL;
    console.log("Redis url" + redisURL);
    if (redisURL) {
        // Create the Redis client object
        redisClient = createClient({ url: redisURL });
        redisClient.on("error", (error) => {
            console.error(`Failed to connect to Redis with error: ${error}`);
        });
        console.log(`Redis client initialized successfully!`);
    }
};


module.exports = {
    initializeRedisClient,
    getRedisClient: () => redisClient 
};