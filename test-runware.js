// Quick test to verify Runware SDK installation
require('dotenv').config();

console.log('='.repeat(60));
console.log('Testing Runware SDK Installation');
console.log('='.repeat(60));

// Test 1: Check if module can be loaded
console.log('\n1. Testing module load...');
try {
  const runwareModule = require('@runware/sdk-js');
  console.log('✅ Module loaded successfully');
  console.log('   Exports:', Object.keys(runwareModule));
  
  const Runware = runwareModule.Runware || runwareModule.default || runwareModule;
  
  if (Runware) {
    console.log('✅ Runware class found');
  } else {
    console.log('❌ Runware class not found in exports');
    process.exit(1);
  }
  
  // Test 2: Check environment variables
  console.log('\n2. Checking environment variables...');
  const apiKey = process.env.RUNWARE_API_KEY;
  if (apiKey) {
    console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
  } else {
    console.log('⚠️  RUNWARE_API_KEY not set in .env file');
  }
  
  // Test 3: Try to initialize
  console.log('\n3. Testing Runware initialization...');
  (async () => {
    try {
      console.log('   Connecting to Runware...');
      const runware = await Runware.initialize({
        apiKey: apiKey || '',
        timeoutDuration: 30000
      });
      
      console.log('✅ Successfully connected to Runware!');
      console.log('\n' + '='.repeat(60));
      console.log('✅ All tests passed! Runware is ready to use.');
      console.log('='.repeat(60));
      
      await runware.disconnect();
      process.exit(0);
      
    } catch (error) {
      console.log('❌ Failed to connect to Runware');
      console.log('   Error:', error.message);
      console.log('\n' + '='.repeat(60));
      console.log('❌ Tests failed. Check the error above.');
      console.log('='.repeat(60));
      process.exit(1);
    }
  })();
  
} catch (error) {
  console.log('❌ Failed to load Runware SDK');
  console.log('   Error:', error.message);
  console.log('\n💡 Solution: Run "npm install @runware/sdk-js"');
  console.log('='.repeat(60));
  process.exit(1);
}
