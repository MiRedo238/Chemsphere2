const cron = require('node-cron');
const { 
  checkLowStock, 
  checkExpiringChemicals, 
  checkEquipmentMaintenance 
} = require('../services/notificationService');

// Run notification checks daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily notification checks...');
  
  await checkLowStock();
  await checkExpiringChemicals();
  await checkEquipmentMaintenance();
  
  console.log('Daily notification checks completed');
});

// For Vercel deployment, we'll use serverless functions instead of cron
// This file will be used for local development