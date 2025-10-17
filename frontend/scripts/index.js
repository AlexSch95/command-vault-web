import { loadGlobalTheme, showFeedback } from "./shared/shared.js";

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
  });

  //desc: zeigt ein modal mit login und registrierung tabs
  function showAuthModal() {
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = `
    <div id="authModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="authModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="authModalLabel">${window.i18n.translate("pages.index.auth.header")}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs" id="authTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab" aria-controls="login" aria-selected="true">
                  ${window.i18n.translate("pages.index.auth.loginTab")}
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button" role="tab" aria-controls="register" aria-selected="false">
                  ${window.i18n.translate("pages.index.auth.registerTab")}
                </button>
              </li>
            </ul>
            
            <div class="tab-content mt-3" id="authTabContent">
              <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
                <form id="loginForm">
                  <div class="mb-3">
                    <label for="loginUsername" class="form-label">${window.i18n.translate("pages.index.auth.username")}</label>
                    <input type="text" class="form-control" id="loginUsername" required>
                  </div>
                  <div class="mb-3">
                    <label for="loginPassword" class="form-label">${window.i18n.translate("pages.index.auth.password")}</label>
                    <input type="password" class="form-control" id="loginPassword" required>
                  </div>
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="rememberMe">
                    <label class="form-check-label" for="rememberMe">
                      ${window.i18n.translate("pages.index.auth.rememberMe")}
                    </label>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">${window.i18n.translate("pages.index.auth.loginButton")}</button>
                </form>
              </div>
              
              <div class="tab-pane fade" id="register" role="tabpanel" aria-labelledby="register-tab">
                <form id="registerForm">
                  <div class="mb-3">
                    <label for="registerUsername" class="form-label">${window.i18n.translate("pages.index.auth.username")}</label>
                    <input type="text" class="form-control" id="registerUsername" required>
                  </div>
                  <div class="mb-3">
                    <label for="registerEmail" class="form-label">${window.i18n.translate("pages.index.auth.mail")}</label>
                    <input type="email" class="form-control" id="registerEmail" required>
                  </div>
                  <div class="mb-3">
                    <label for="registerPassword" class="form-label">${window.i18n.translate("pages.index.auth.password")}</label>
                    <input type="password" class="form-control" id="registerPassword" required>
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">${window.i18n.translate("pages.index.auth.confirmPassword")}</label>
                    <input type="password" class="form-control" id="confirmPassword" required>
                  </div>
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="acceptTerms" required>
                    <label class="form-check-label" for="acceptTerms">
                      ${window.i18n.translate("pages.index.auth.acceptTos")}
                    </label>
                  </div>
                  <button type="submit" class="btn btn-success w-100">${window.i18n.translate("pages.index.auth.registerButton")}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    modal.show();

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

    switch (result.message) {
      case "USER_NOT_FOUND":
        showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.userNotFound")}` });
        break;
      case "INVALID_PASSWORD":
        showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.invalidPassword")}` });
        break;
      case "UNDEFINED_REQUEST":
        showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.missingCredentials")}` });
        break;
      case "LOGIN_SUCCESS":
        showFeedback({ success: true, message: `${window.i18n.translate("pages.index.auth.messages.loginSuccess")}` });
        break;
    }
    if (result.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
      modal.hide();
      return;
    }
  }

  //desc: behandelt registrierung formular
  async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    if (password !== confirmPassword) {
      showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.passwordsDoNotMatch")}` });
      return;
    }

    if (!acceptTerms) {
      showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.termsNotAccepted")}` });
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

    switch (result.message) {
      case "USERNAME_ALREADY_EXISTS":
        showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.userExists")}` });
        break;
      case "EMAIL_ALREADY_EXISTS":
        showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.emailExists")}` });
        break;
      case "UNDEFINED_REQUEST":
        showFeedback({ success: false, message: `${window.i18n.translate("pages.index.auth.messages.missingCredentials")}` });
        break;
      case "USER_CREATED":
        showFeedback({ success: true, message: `${window.i18n.translate("pages.index.auth.messages.registerSuccess")}` });
        break;
    }
    if (result.success) {
      document.getElementById("login-tab").click();

    }
  }
});
