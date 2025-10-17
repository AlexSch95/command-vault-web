import { loadGlobalTheme } from "./shared/shared.js";

document.addEventListener("DOMContentLoaded", async () => {

  init();

  function init() {
    loadGlobalTheme();
  }


  if (window.i18n) {
    await window.i18n.ready;
  }

  const modal = new bootstrap.Modal(document.getElementById('gettingStartedModal'), {
    backdrop: false,
    keyboard: true
  });

  const languageSwitchers = document.querySelectorAll('.language-switcher');
  languageSwitchers.forEach(switcher => {
    switcher.addEventListener('click', async (event) => {
      event.preventDefault();
      const selectedLang = switcher.getAttribute('data-language');
      await window.switchLanguage(selectedLang);
      window.i18n.updatePage();
    });
  });

  document.getElementById('getStarted').addEventListener('click', () => {
    modal.show();
  });

  document.getElementById('gettingStartedCloseBtn').addEventListener('click', () => {
    modal.hide();
  });

  document.getElementById('authButton').addEventListener('click', () => {
    showAuthModal();
    console.log("1");
  });

  //desc: zeigt ein modal mit login und registrierung tabs
  function showAuthModal() {
    // Entferne existierendes Modal falls vorhanden
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Erstelle Modal HTML
    const modalHTML = `
    <div id="authModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="authModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="authModalLabel">Anmeldung</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs" id="authTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab" aria-controls="login" aria-selected="true">
                  Login
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button" role="tab" aria-controls="register" aria-selected="false">
                  Registrierung
                </button>
              </li>
            </ul>
            
            <div class="tab-content mt-3" id="authTabContent">
              <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
                <form id="loginForm">
                  <div class="mb-3">
                    <label for="loginUsername" class="form-label">Benutzername</label>
                    <input type="text" class="form-control" id="loginUsername" required>
                  </div>
                  <div class="mb-3">
                    <label for="loginPassword" class="form-label">Passwort</label>
                    <input type="password" class="form-control" id="loginPassword" required>
                  </div>
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="rememberMe">
                    <label class="form-check-label" for="rememberMe">
                      Angemeldet bleiben
                    </label>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Anmelden</button>
                </form>
              </div>
              
              <!-- Register Tab -->
              <div class="tab-pane fade" id="register" role="tabpanel" aria-labelledby="register-tab">
                <form id="registerForm">
                  <div class="mb-3">
                    <label for="registerUsername" class="form-label">Benutzername</label>
                    <input type="text" class="form-control" id="registerUsername" required>
                  </div>
                  <div class="mb-3">
                    <label for="registerEmail" class="form-label">E-Mail</label>
                    <input type="email" class="form-control" id="registerEmail" required>
                  </div>
                  <div class="mb-3">
                    <label for="registerPassword" class="form-label">Passwort</label>
                    <input type="password" class="form-control" id="registerPassword" required>
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Passwort bestätigen</label>
                    <input type="password" class="form-control" id="confirmPassword" required>
                  </div>
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="acceptTerms" required>
                    <label class="form-check-label" for="acceptTerms">
                      Ich akzeptiere die Nutzungsbedingungen
                    </label>
                  </div>
                  <button type="submit" class="btn btn-success w-100">Registrieren</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Füge Modal zum DOM hinzu
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event Listener für Formulare
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Zeige Modal
    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    modal.show();

    // Entferne Modal aus DOM wenn es geschlossen wird
    document.getElementById('authModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  }

  //desc: behandelt login formular
  async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const loginData = {
      username: username,
      password: password,
      rememberMe: rememberMe
    };

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();

    // Beispiel für erfolgreiches Login

    // Modal schließen
    const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
    modal.hide();
  }

  //desc: behandelt registrierung formular
  async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    // Passwort-Validierung
    if (password !== confirmPassword) {
      return;
    }

    if (!acceptTerms) {
      return;
    }

    const registerData = {
      username: username,
      email: email,
      password: password
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const result = await response.json();

    // Beispiel für erfolgreiche Registrierung

    // Modal schließen
    const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
    modal.hide();
  }
});
