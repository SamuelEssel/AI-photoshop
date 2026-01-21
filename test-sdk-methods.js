// Quick test to check available Runware methods
require('dotenv').config();

(async () => {
  try {
    const { Runware } = require('@runware/sdk-js');
    
    console.log('Initializing Runware...');
    const runware = await Runware.initialize({
      apiKey: process.env.RUNWARE_API_KEY || 'GjlXf7wXg8mTDd9tpwTSShjA9KbeXBf9',
      timeoutDuration: 30000
    });
    
    console.log('\n✅ Runware initialized successfully!\n');
    console.log('Available methods and properties:');
    console.log(Object.getOwnPropertyNames(runware).filter(name => typeof runware[name] === 'function'));
    console.log('\nAll keys:');
    console.log(Object.keys(runware));
    
    await runware.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
