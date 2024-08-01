let cron = require('node-cron');

let cronJob=cron.schedule('* * 23 * * *', () => {
  console.log('running a task every day');
});
module.exports = { cronJob };

