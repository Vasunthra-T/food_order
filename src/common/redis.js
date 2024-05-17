const { createClient } = require("redis-promisify");

let redisClient;

const initializeRedisClient = () => {
    const redisURL = process.env.REDIS_URL;
    console.log("Redis URL:", redisURL);

    if (!redisURL) {
        console.error('REDIS_URL environment variable not set');
        return;
    }

    try {
        redisClient = createClient({ url: redisURL });
        redisClient.on("error", (error) => {
            console.error(`Failed to connect to Redis with error: ${error}`);
        });

        redisClient.on("connect", () => {
            console.log("Redis client connected successfully!");
        });

    } catch (error) {
        console.error(`Error initializing Redis client: ${error}`);
    }
};

module.exports = {
    initializeRedisClient,
    getRedisClient: () => redisClient
};
