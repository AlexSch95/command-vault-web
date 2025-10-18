import { loadGlobalTheme, checkAuth, showFeedback, initNavigation } from "./shared/shared.js";
import { themes } from "./shared/presetThemes.js";


if (window.i18n) {
  await window.i18n.ready;
}

async function initPage() {
  const authStatus = await checkAuth();
  if (authStatus && authStatus.success) {
    loadCategories();
    setupCurrentColors();
    loadBackgroundImages();
    loadDeletedCommands();
  } else if (!authStatus || !authStatus.success) {
    window.location.href = "index.html";
    return;
  }
  initNavigation("settings.html", authStatus);
}

initPage();
await loadGlobalTheme();

//desc: globale variablen
let newTechMode = false;

//desc: Themes Eventlistener
document.querySelectorAll('.theme-colorpicker').forEach(colorPicker => {
  colorPicker.addEventListener('change', () => {
    const hexDisplay = document.getElementById('hex-display');
    customTheme();
  });
});

document.getElementById('preset-themes').addEventListener('click', (event) => {
  const theme = event.target.dataset.theme;
  if (theme) {
    applyTheme(theme);
  }
});

document.getElementById('backgroundimages-list').addEventListener('click', async (event) => {
  if (event.target.classList.contains('bg-image-preview')) {
    const fileName = event.target.dataset.image;
    applyBackgroundImage(fileName);
  }
});

//desc: Kategorien Eventlistener
document.getElementById('add-technology-btn').addEventListener('click', (event) => {
  event.preventDefault();
  addCategory();
});

document.getElementById('reset-categories-btn').addEventListener('click', (event) => {
  event.preventDefault();
  loadCategories();
  document.getElementById('add-technology-form').reset();
  document.getElementById('delete-technology-btn').disabled = true;
});

document.getElementById('color').addEventListener('input', (event) => {
  const hexDisplay = document.getElementById('hex-display');
  hexDisplay.textContent = event.target.value;
});

document.getElementById('delete-technology-btn').addEventListener('click', (event) => {
  event.preventDefault();
  deleteCategory();
});


//desc: Befehl restoren Eventlistener
document.getElementById('restore-commands-container').addEventListener('click', async (event) => {
  if (event.target.classList.contains('restore-command-btn')) {
    const commandId = event.target.dataset.id;
    restoreCommand(commandId);
  } else if (event.target.classList.contains('fully-delete-cmd-btn')) {
    const commandId = event.target.dataset.id;
    fullyDeleteCommand(commandId);
  }
});



async function loadCategories() {
  try {
    newTechMode = false;
    const response = await fetch('/api/categories/all');
    const result = await response.json();
    const categories = result.data;

    const techContainer = document.getElementById('tech-container');
    techContainer.innerHTML = '';

    const flexContainer = document.createElement('div');
    flexContainer.className = 'd-flex align-items-center gap-2';

    const techSelect = document.createElement('select');
    techSelect.id = 'tech';
    techSelect.className = 'form-select form-select-lg bg-dark border-secondary text-light flex-grow-1';
    if (!categories || categories.length === 0) {
      document.getElementById('delete-technology-btn').disabled = true;
      techSelect.innerHTML = `<option value="">${window.i18n.translate("pages.settings.categories.noCategories")}</option>`;
    } else {
      techSelect.innerHTML = `<option value="">${window.i18n.translate("pages.settings.categories.categoryPlaceholder")}</option>`;
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.category_id;
        option.textContent = cat.category_name;
        option.dataset.color = cat.category_color;
        techSelect.appendChild(option);
      });
    }


    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.textContent = `${window.i18n.translate("pages.settings.categories.buttons.addNew")}`;
    newButton.id = 'new-tech-btn';
    newButton.className = 'btn btn-primary btn-sm';

    flexContainer.appendChild(techSelect);
    flexContainer.appendChild(newButton);
    techContainer.appendChild(flexContainer);

    techSelect.addEventListener('change', (event) => {
      const selectedOption = event.target.options[event.target.selectedIndex];
      const colorInput = document.getElementById('color');
      colorInput.value = selectedOption.dataset.color || '#007bff';
      const hexDisplay = document.getElementById('hex-display');
      hexDisplay.textContent = colorInput.value;
      document.getElementById('delete-technology-btn').disabled = false;
    });

    newButton.addEventListener('click', () => {
      newTechMode = true;
      document.getElementById('delete-technology-btn').disabled = true;
      document.getElementById('tech-container').innerHTML = `
                    <input type="text" id="tech" class="form-control form-control-lg bg-dark border-secondary text-light" placeholder="Linux, JavaScript, Python..." required>
                `;
      document.getElementById('color').value = '#007bff';
      document.getElementById('hex-display').textContent = '#007bff';
    })
  } catch (error) {
    console.error('Fehler beim Laden der Technologien:', error);
  }
}

export async function addCategory() {
  const category = document.getElementById('tech');
  const color = document.getElementById('color');
  if (newTechMode === true && category.value != '') {
    try {
      const response = await fetch('/api/categories/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_name: category.value,
          category_color: color.value
        })
      });
      if (response.ok) {
        showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.categories.messages.categorySaved")}` });
        document.getElementById('add-technology-form').reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.categorySaveError")}` });
    }
  } else if (newTechMode === false && tech.value != '') {
    try {
      const response = await fetch("/api/categories/update", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_color: color.value
        })
      })
      if (response.ok) {
        showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.categories.messages.categoryUpdated")}` });
        document.getElementById('add-technology-form').reset();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.categoryUpdateError")}` });
    }
  } else if (tech.value == '') {
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.noCategorySelected")}` });
  }
  loadCategories();
}

async function applyBackgroundImage(fileName) {
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

async function loadBackgroundImages() {
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

async function customTheme() {
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

async function setupCurrentColors() {
  const savedTheme = JSON.parse(localStorage.getItem('command-vault-theme'));

  document.getElementById('bg-primary-color').value = savedTheme.bgPrimary;
  document.getElementById('bg-secondary-color').value = savedTheme.bgSecondary;
  document.getElementById('border-color').value = savedTheme.borderColor;
  document.getElementById('text-primary-color').value = savedTheme.textPrimary;
  document.getElementById('accent-color').value = savedTheme.accentColor;
  document.getElementById('text-color-code').value = savedTheme.textColorCode;
}

async function applyTheme(chosenTheme) {
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

async function deleteCategory() {
  const tech = document.getElementById('tech');
  if (tech.value != '') {
    const techName = tech.options[tech.selectedIndex].text;

    // Modal erstellen und anzeigen
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'deleteModal';
    modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content bg-secondary">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title text-light">${window.i18n.translate("pages.settings.categories.modal.title")}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-light">
                            <p>${window.i18n.translate("pages.settings.categories.modal.warning")}</p>
                            <p>${window.i18n.translate("pages.settings.categories.modal.confirmThisp1")}
                            "<strong>${techName}</strong>"
                            ${window.i18n.translate("pages.settings.categories.modal.confirmThisp2")}</p>
                            <input type="text" class="form-control bg-dark border-secondary text-light mt-3"
                                   id="confirmTechName" placeholder="${techName}" autocomplete="off">
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${window.i18n.translate("pages.settings.categories.modal.cancelButton")}
                            </button>
                            <button type="button" class="btn btn-danger" id="confirmDelete" disabled>
                            ${window.i18n.translate("pages.settings.categories.modal.deleteButton")}
                            </button>
                        </div>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    const confirmInput = document.getElementById('confirmTechName');
    const confirmButton = document.getElementById('confirmDelete');

    // Input-Validierung in Echtzeit
    confirmInput.addEventListener('input', () => {
      if (confirmInput.value === techName) {
        confirmButton.disabled = false;
        confirmButton.classList.remove('btn-danger');
        confirmButton.classList.add('btn-danger');
      } else {
        confirmButton.disabled = true;
      }
    });

    confirmButton.addEventListener('click', async () => {
      if (confirmInput.value === techName) {
        try {
          const response = await fetch(`/api/categories/delete/${tech.value}`, {
            method: "DELETE",
          });
          if (response.ok) {
            showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.categories.messages.categoryDeleted")}` });
            document.getElementById('add-technology-form').reset();
            loadCategories();
            bootstrapModal.hide();
          } else {
            throw new Error('Fehler beim Löschen der Kategorie');
          }
        } catch (error) {
          console.error('Datenbank Fehler:', error);
          showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.categoryDeleteError")}` });
        }
      }
    });

    // Modal nach Schließen entfernen
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }
}

async function fullyDeleteCommand(commandId) {
  try {
    const response = await fetch(`/api/commands/delete/${commandId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (result.success) {
      showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.restorecommand.messages.fullyDeleteSuccess")}` });
      loadDeletedCommands();
    }
  } catch (error) {
    console.log('Fehler beim Löschen des Commands:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.restorecommand.messages.fullyDeleteError")}` });
  }
}

async function loadDeletedCommands() {
  try {
    const deletedCommandsContainer = document.getElementById('restore-commands-container');
    const response = await fetch('/api/commands/trash');
    const result = await response.json();
    const deletedCommands = result.data;
    deletedCommandsContainer.innerHTML = '';
    if (deletedCommands.length === 0) {
      deletedCommandsContainer.innerHTML = `<p class="text-muted">${window.i18n.translate("pages.settings.restorecommand.noDeletedCommands")}</p>`;
      return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
                <tr>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.category")}</th>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.command")}</th>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.deletedAt")}</th>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.actions")}</th>
                </tr>
            `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    deletedCommands.forEach(cmd => {
      const row = document.createElement('tr');
      row.innerHTML = `
                    <td><span class="badge" style="background-color: ${cmd.category_color};"><span class="fs-5">${cmd.category_name}</span></span></td>
                    <td>${cmd.cmd.length > 9 ? cmd.cmd.substring(0, 9) + '...' : cmd.cmd}</td>
                    <td>${new Date(cmd.deleted_at).toLocaleDateString()}</td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm restore-command-btn" data-id="${cmd.cmd_id}">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button class="btn btn-danger btn-sm fully-delete-cmd-btn" data-id="${cmd.cmd_id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    deletedCommandsContainer.appendChild(table);
  } catch (error) {
    console.error('Fehler beim Laden der gelöschten Commands:', error);
    const container = document.getElementById('restore-commands-container');
    container.innerHTML = `<p class="text-danger">Fehler beim Laden der gelöschten Befehle.</p>`;
  }
}

export async function restoreCommand(commandId) {
  try {
    const response = await fetch(`/api/commands/trash/restore/${commandId}`, {
      method: 'POST'
    });
    const result = await response.json();
    if (result.success) {
      showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.restorecommand.messages.restoreSuccess")}` });
      loadDeletedCommands();
    }
  } catch (error) {
    console.log('Fehler beim Wiederherstellen des Commands:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.restorecommand.messages.restoreError")}` });
  }
}