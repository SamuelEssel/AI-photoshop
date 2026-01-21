// Test Runware service directly
require('dotenv').config();
const runwareService = require('./server/services/runware');

(async () => {
  try {
    console.log('Testing Runware service directly...\n');
    
    const result = await runwareService.generateImage({
      prompt: 'A cute cat',
      width: 512,
      height: 512,
      steps: 30
    });
    
    console.log('✅ Success!');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error caught:');
    console.error('Type:', typeof error);
    console.error('Constructor:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('Keys:', Object.keys(error));
    console.error('Full error:', error);
    process.exit(1);
  }
})();
