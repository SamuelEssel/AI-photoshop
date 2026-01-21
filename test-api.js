// Test the API endpoint directly
const axios = require('axios');

(async () => {
  try {
    console.log('Testing /api/ai/generate endpoint...\n');
    
    const response = await axios.post('http://localhost:3000/api/ai/generate', {
      prompt: 'A cute cat',
      width: 512,
      height: 512,
      steps: 30
    });
    
    console.log('✅ Success!');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('\nFull error:', error);
  }
})();
