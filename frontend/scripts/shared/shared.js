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
        document.body.style.backgroundImage = `url('/frontend/assets/default-backgrounds/${savedTheme.backgroundImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
      }
    }

  } catch (error) {
    console.error('Fehler beim Laden des globalen Themes:', error);
  }
}

export async function openSettingsWindow() {
  let settingsModal = document.getElementById('settingsModal');
  if (!settingsModal) {
    const modalHtml = `
      <div class="modal modal-card fade" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">
        <div class="modal-dialog settings-modal-dialog">
          <div class="modal-content settings-modal-content">
              <div class="modal-body settings-modal-body">
                      <div class="custom-titlebar">
        <div class="titlebar-left">
          <div class="titlebar-title text-primary" data-i18n="nav.settings">
            Einstellungen
          </div>
        </div>
        <div class="titlebar-controls">
          <button class="titlebar-btn saveandclose rounded-2" id="btn-close" data-bs-dismiss="modal" title="Close">
            <i class="bi bi-check text-primary"></i>
          </button>
        </div>
      </div>
              <iframe id="settingsContent" src="settings.html" class="settings-iframe"></iframe>
            </div>
          </div>
        </div>
      </div>
      `
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    settingsModal = document.getElementById('settingsModal');
  }

  const modal = new bootstrap.Modal(settingsModal, {
    backdrop: 'static',
    keyboard: false
  });

  modal.show();
  settingsModal.addEventListener('hidden.bs.modal', () => {
    settingsModal.remove();
    loadGlobalTheme();
  });
}