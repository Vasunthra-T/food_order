// app.js
const rateLimit = require('express-rate-limit');
const express = require('express');
const { sequelize } = require('./src/models');
const { initializeRedisClient } = require("./src/common/redis");
const cron = require('./src/common/cron');
const auth = require('./src/common/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    limit: 5, // Limit each IP to 5 requests per `window`
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
});

app.use(limiter);
app.use(express.json());

require('./src/routes/user.routes')(app);
require('./src/routes/item.routes')(app);
require('./src/routes/order.routes')(app);

initializeRedisClient();

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

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started successfully`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });
