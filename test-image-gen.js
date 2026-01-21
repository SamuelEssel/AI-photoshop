// Test actual image generation with Runware
require('dotenv').config();

(async () => {
  try {
    const { Runware } = require('@runware/sdk-js');
    
    console.log('Initializing Runware...');
    const runware = await Runware.initialize({
      apiKey: process.env.RUNWARE_API_KEY || 'GjlXf7wXg8mTDd9tpwTSShjA9KbeXBf9',
      timeoutDuration: 60000
    });
    
    console.log('✅ Connected!');
    console.log('Has requestImages:', typeof runware.requestImages);
    console.log('Has imageInference:', typeof runware.imageInference);
    
    if (typeof runware.requestImages === 'function') {
      console.log('\n🎨 Testing requestImages method...');
      const images = await runware.requestImages({
        positivePrompt: "A cute cat",
        model: "runware:101@1",
        width: 512,
        height: 512,
        numberResults: 1
      });
      
      console.log('✅ Success!', images[0].imageURL);
    } else if (typeof runware.imageInference === 'function') {
      console.log('\n🎨 Testing imageInference method...');
      const images = await runware.imageInference({
        positivePrompt: "A cute cat",
        model: "runware:101@1",
        width: 512,
        height: 512,
        numberResults: 1
      });
      
      console.log('✅ Success!', images[0].imageURL);
    } else {
      console.log('❌ Neither requestImages nor imageInference found!');
    }
    
    await runware.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
