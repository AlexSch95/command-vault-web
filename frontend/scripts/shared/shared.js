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

//desc: zeigt ein modal mit login und registrierung tabs
export function showAuthModal() {
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
            <!-- Nav tabs -->
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
            
            <!-- Tab panes -->
            <div class="tab-content mt-3" id="authTabContent">
              <!-- Login Tab -->
              <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
                <form id="loginForm">
                  <div class="mb-3">
                    <label for="loginEmail" class="form-label">E-Mail</label>
                    <input type="email" class="form-control" id="loginEmail" required>
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