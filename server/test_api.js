const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testAPI() {
  try {
    console.log('Testing vehicle reference API...');
    
    // Test makes endpoint
    const makes = await makeRequest('http://localhost:5000/api/vehicle-reference/makes');
    console.log(`✅ Makes loaded: ${makes.length} makes found`);
    console.log('First few makes:', makes.slice(0, 5));
    
    if (makes.length > 0) {
      // Test models for first make
      const firstMake = makes[0];
      const models = await makeRequest(`http://localhost:5000/api/vehicle-reference/models/${encodeURIComponent(firstMake)}`);
      console.log(`✅ Models for ${firstMake}: ${models.length} models found`);
      console.log('First few models:', models.slice(0, 3));
      
      if (models.length > 0) {
        // Test years for first make/model
        const firstModel = models[0];
        const years = await makeRequest(`http://localhost:5000/api/vehicle-reference/years/${encodeURIComponent(firstMake)}/${encodeURIComponent(firstModel)}`);
        console.log(`✅ Years for ${firstMake} ${firstModel}: ${years.length} years found`);
        console.log('Years:', years.slice(0, 5));
      }
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();
