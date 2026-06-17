async function login() {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('login-btn');
      const spinner = document.getElementById('spinner');
      const btnText = document.getElementById('btn-text');
      const errorMsg = document.getElementById('error-msg');

      if (!email || !password) {
        errorMsg.textContent = '❌ Vul e-mailadres en wachtwoord in.';
        errorMsg.classList.add('show');
        return;
      }

      btn.disabled = true;
      spinner.style.display = 'block';
      btnText.textContent = 'Bezig...';
      errorMsg.classList.remove('show');

      try {
        const res = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('admin_token', data.token);
          window.location.href = 'admin-dashboard.html';
        } else {
          errorMsg.textContent = '❌ ' + (data.bericht || 'Inloggen mislukt.');
          errorMsg.classList.add('show');
        }
      } catch (err) {
        errorMsg.textContent = '❌ Kan geen verbinding maken met de server.';
        errorMsg.classList.add('show');
      } finally {
        btn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Inloggen →';
      }
    }