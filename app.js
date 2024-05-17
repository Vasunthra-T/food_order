const rateLimit = require('express-rate-limit');
const express = require('express');
const { sequelize } = require('./src/models');
const { initializeRedisClient } = require("./src/common/redis");
const cron = require('./src/common/cron');
const auth = require('./src/common/authMiddleware');



const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.send('Hello World!')
});

const limiter = rateLimit({
    windowMs: 10000, // 15 minutes
    limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Middleware
app.use(express.json());

// Initialize routes
require('./src/routes/user.routes')(app);
require('./src/routes/item.routes')(app);
require('./src/routes/order.routes')(app);

// connect to Redis
initializeRedisClient();


// Authenticate token
app.get("/authenticate", auth.verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      data: {
        user: {
            email: req.user.email,
        },
      },
    });

  } catch (err) {
    res.status(err.status).json({
        message: err.message,
      });
  }

});


// start the server
sequelize.sync({ alter: true }) // Use force:true to drop existing tables and recreate them
  .then(() => {
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
});




