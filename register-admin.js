const fetch = require('node-fetch');

async function registerAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/users/register/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error registering admin:', error);
  }
}

registerAdmin();