// test-post-user.js
// this file is only for testing the create function
import fetch from 'node-fetch';  

async function testCreateUser() {
  const url = 'http://localhost:4000/users';
  const payload = {
    firstname:    'hahabo',
    lastname:     'Cool',
    email:        'jon3.doe@example.com',
    phone_number: '1290',
    account_name: 'jondoe',
    password:     's3cre11t',
    postal_code:  '80309',
  };

  try {
    // send request
    const response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      
    });

    
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const body = await response.json();
    console.log('Response body:', body);

    if (response.ok) {
      console.log('✅ successful new user ID =', body.id);
    } else {
      console.error('❌ failed error msg =', body.error || body);
    }
  } catch (err) {
    console.error('🔥 abnormal', err);
  }
}

testCreateUser();
