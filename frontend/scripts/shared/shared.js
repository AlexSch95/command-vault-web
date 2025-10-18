import { themes } from "./presetThemes.js";

//desc: feedback funktion
export function showFeedback(result) {
  const { success, message } = result;
  const errorText = document.getElementById("errorText");
  const errorBox = document.getElementById("errorMessage");
  if (success === true) {
    errorText.textContent = message;
    errorBox.classList.add("alert-success");
  } else if (success === false) {
    errorText.textContent = message;
    errorBox.classList.add("alert-danger");
  }
  errorBox.classList.remove("d-none");
  errorBox.classList.add("show");
  setTimeout(() => {
    errorBox.classList.remove("show");
    setTimeout(() => {
      errorText.textContent = "";
      errorBox.classList.add("d-none");
      errorBox.classList.remove("alert-success", "alert-danger");
    }, 600);
  }, 3000);
}

//desc: lädt das gespeicherte theme und wendet es an
export async function loadGlobalTheme() {
  try {
    let savedTheme = JSON.parse(localStorage.getItem('command-vault-theme'));
    if (!savedTheme) {
      savedTheme = themes.dark;
      localStorage.setItem('command-vault-theme', JSON.stringify(savedTheme));
    }

    if (savedTheme) {
      const root = document.documentElement;
      root.style.setProperty('--bg-primary', savedTheme.bgPrimary);
      root.style.setProperty('--bg-secondary', savedTheme.bgSecondary);
      root.style.setProperty('--border-color', savedTheme.borderColor);
      root.style.setProperty('--text-primary', savedTheme.textPrimary);
      root.style.setProperty('--accent-color', savedTheme.accentColor);
      root.style.setProperty('--text-color-code', savedTheme.textColorCode);
      if (savedTheme.backgroundImage === "none") {
        document.body.style.backgroundColor = savedTheme.bgPrimary;
        document.body.style.backgroundImage = 'none';
      } else {
        document.body.style.backgroundImage = `url('../../assets/default-backgrounds/${savedTheme.backgroundImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
      }
    }

  } catch (error) {
    console.error('Fehler beim Laden des globalen Themes:', error);
  }
}

export async function checkAuth() {
  try {
    const response = await fetch('/api/auth/verify');
    const result = await response.json();
    if (!result.success) {
      return { success: false, message: "AUTH_FAILED" };
    }
    return { success: true, message: "AUTH_SUCCESS" };
  } catch (error) {
    console.error('Fehler bei der Authentifizierung:', error);
    return { success: false, message: "AUTH_FAILED" };
  }
}

export function initNavigation(currentPage, authStatus) {
  const navButtonsContainer = document.getElementById('navButtons');

  const navLoggedIn = [
    { href: 'add-command.html', icon: 'bi-plus', key: 'nav.addCommand', text: 'Befehl hinzufügen' },
    { href: 'view-commands.html', icon: 'bi-list-ul', key: 'nav.viewCommands', text: 'Befehle anzeigen' },
    { href: 'settings.html', icon: 'bi-gear', key: 'nav.settings', text: 'Einstellungen' }
  ];

  if (authStatus.success === true) {
    navLoggedIn.forEach(item => {
      const link = document.createElement('a');
      link.href = item.href;
      link.className = `nav-button${currentPage === item.href ? ' active' : ''}`;
      link.innerHTML = `
      <i class="bi ${item.icon}"></i>
      <span class="nav-text" data-i18n="${item.key}">${item.text}</span>
    `;
      navButtonsContainer.appendChild(link);
    });
    const logoutButton = document.createElement('a');
    logoutButton.href = "#";
    logoutButton.className = 'nav-button';
    logoutButton.innerHTML = `
      <i class="bi bi-box-arrow-right"></i>
      <span class="nav-text" data-i18n="nav.logout">Abmelden</span>
    `;
    logoutButton.addEventListener('click', async (event) => {
      event.preventDefault();
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        window.location.href = "./index.html";
      }
    });
    navButtonsContainer.appendChild(logoutButton);
  } else {
    const loginLink = document.createElement('a');
    loginLink.href = '#';
    loginLink.className = 'nav-button';
    loginLink.innerHTML = `
      <i class="bi bi-box-arrow-in-right"></i>
      <span class="nav-text" data-i18n="nav.login">Anmelden</span>
    `;
    navButtonsContainer.appendChild(loginLink);
    loginLink.addEventListener('click', async (event) => {
      event.preventDefault();
      showAuthModal();
    });
  }
}

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
    setTimeout(() => {
      window.location.reload();
    }, 500);
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