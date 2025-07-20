document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('userType').value;
        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;
  
        const data = type === 'donor' ? { email: identifier, password } : { phone_number: identifier, password };
  
        const res = await fetch(`/api/users/login/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
  
        const result = await res.json();
        alert(result.message);
      });
    }
  });
  