const cron = require('node-cron');
const mail = require('../common/mailing');


cron.schedule('22 15 * * *', () => {
    console.log("Entering cron")
    mail.send();
});