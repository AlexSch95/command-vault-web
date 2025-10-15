
import { themes } from "../shared/presetThemes.js";
import { loadGlobalTheme, showFeedback } from "../shared/shared.js";

export function init() {
  setupCurrentColors();
  loadBackgroundImages();
}

if (window.i18n) {
  await window.i18n.ready;
}

export async function setupCurrentColors() {
  const savedTheme = JSON.parse(localStorage.getItem('command-vault-theme'));

  document.getElementById('bg-primary-color').value = savedTheme.bgPrimary;
  document.getElementById('bg-secondary-color').value = savedTheme.bgSecondary;
  document.getElementById('border-color').value = savedTheme.borderColor;
  document.getElementById('text-primary-color').value = savedTheme.textPrimary;
  document.getElementById('accent-color').value = savedTheme.accentColor;
  document.getElementById('text-color-code').value = savedTheme.textColorCode;
}

export async function customTheme() {

  const backgroundImageName = savedTheme.backgroundImage;
  const themeData = {
    bgPrimary: document.getElementById('bg-primary-color').value,
    bgSecondary: document.getElementById('bg-secondary-color').value,
    borderColor: document.getElementById('border-color').value,
    textPrimary: document.getElementById('text-primary-color').value,
    accentColor: document.getElementById('accent-color').value,
    textColorCode: document.getElementById('text-color-code').value,
    backgroundImage: backgroundImageName
  };
  applyTheme(themeData);
}

export async function applyTheme(chosenTheme) {
  let themeData;

  if (typeof chosenTheme === 'string') {
    themeData = themes[chosenTheme]
  } else {
    themeData = chosenTheme;
  }

  localStorage.setItem('command-vault-theme', JSON.stringify(themeData));
  showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.themes.messages.themeApplied")}` });
  loadGlobalTheme();
  setupCurrentColors();

}


export async function loadBackgroundImages() {
  try {
    const defaultBackgrounds = ["default-coffee.jpg", "default-light.jpg", "default-navy.jpg", "default-dark.png"]
    const bgListContainer = document.getElementById('backgroundimages-list');
    bgListContainer.innerHTML = '';
    const noBackgroundCol = document.createElement('div');
    noBackgroundCol.className = 'col-lg-3 col-md-4 col-sm-6 col-12';
    noBackgroundCol.innerHTML = `
            <div class="d-flex justify-content-center align-items-center bg-image-preview border rounded" data-image="none">
              <div class="text-center">
                <i class="bi bi-slash-circle fs-1 mb-2 pe-none"></i>
                <div class="small pe-none">${window.i18n.translate("pages.settings.themes.custom.noBackground")}</div>
              </div>
            </div>
          `;
    bgListContainer.appendChild(noBackgroundCol);
    defaultBackgrounds.forEach(file => {
      const col = document.createElement('div');
      col.className = 'col-lg-3 col-md-4 col-sm-6 col-12';
      col.innerHTML = `
                  <div class="bg-image-container">
                    <img src="../../assets/default-backgrounds/${file}" alt="${file}" class="img-fluid bg-image-preview mb-2" data-image="${file}">
                  </div>
              `;
      bgListContainer.appendChild(col);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Hintergrundbilder:', error);
  }
}

export async function applyBackgroundImage(fileName) {
  try {
    const savedTheme = JSON.parse(localStorage.getItem('command-vault-theme'));
    if (savedTheme) {
      savedTheme.backgroundImage = fileName;
      localStorage.setItem('command-vault-theme', JSON.stringify(savedTheme));
    }
    loadGlobalTheme();
    showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.themes.messages.backgroundImageApplied")}` });
  } catch (error) {
    console.error('Fehler beim Anwenden des Hintergrundbilds:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.themes.messages.backgroundImageError")}` });
  }
}


