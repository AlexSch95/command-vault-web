import { loadGlobalTheme } from "./shared/shared.js";
import * as themesHandler from "./settings/themesHandler.js";
import * as categoriesHandler from "./settings/categoriesHandler.js";
import * as restoreCommandsHandler from "./settings/restoreCommandsHandler.js";

document.addEventListener('DOMContentLoaded', async () => {

  if (window.i18n) {
    await window.i18n.ready;
  }

  await loadGlobalTheme();
  await themesHandler.init();
  await categoriesHandler.init();
  // await restoreCommandsHandler.init();


  //desc: Themes Eventlistener
  
  document.querySelectorAll('.theme-colorpicker').forEach(colorPicker => {
    colorPicker.addEventListener('change', () => {
      const hexDisplay = document.getElementById('hex-display');
      themesHandler.customTheme();
    });
  });

  document.getElementById('preset-themes').addEventListener('click', (event) => {
    const theme = event.target.dataset.theme;
    if (theme) {
      themesHandler.applyTheme(theme);
    }
  });

  document.getElementById('backgroundimages-list').addEventListener('click', async (event) => {
    if (event.target.classList.contains('bg-image-preview')) {
      const fileName = event.target.dataset.image;
      themesHandler.applyBackgroundImage(fileName);
    } else if (event.target.id === 'add-bg') {
      document.getElementById('import-background').click();
    } else if (event.target.classList.contains('bg-image-delete-btn')) {
      const fileName = event.target.dataset.deletefile;
      themesHandler.deleteBackgroundImage(fileName);
    }
  });

  //desc: Kategorien Eventlistener
  document.getElementById('add-technology-btn').addEventListener('click', (event) => {
    event.preventDefault();
    categoriesHandler.addCategory();
  });

  document.getElementById('reset-categories-btn').addEventListener('click', (event) => {
    event.preventDefault();
    categoriesHandler.loadCategories();
    document.getElementById('add-technology-form').reset();
    document.getElementById('delete-technology-btn').disabled = true;
  });

  document.getElementById('color').addEventListener('input', (event) => {
    const hexDisplay = document.getElementById('hex-display');
    hexDisplay.textContent = event.target.value;
  });

  document.getElementById('delete-technology-btn').addEventListener('click', (event) => {
    event.preventDefault();
    categoriesHandler.deleteCategory();
  });


  //desc: Befehl restoren Eventlistener
  document.getElementById('restore-commands-container').addEventListener('click', async (event) => {
    if (event.target.classList.contains('restore-command-btn')) {
      const commandId = event.target.dataset.id;
      restoreCommandsHandler.restoreCommand(commandId);
    } else if (event.target.classList.contains('fully-delete-cmd-btn')) {
      const commandId = event.target.dataset.id;
      restoreCommandsHandler.fullyDeleteCommand(commandId);
    }
  });
});