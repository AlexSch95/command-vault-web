import { loadGlobalTheme, openSettingsWindow } from "./shared/shared.js";

document.addEventListener("DOMContentLoaded", async () => {

  init();

  function init() {
    loadGlobalTheme();
  }


  if (window.i18n) {
    await window.i18n.ready;
  }

  document.getElementById("settingsButton").addEventListener("click", (e) => {
    e.preventDefault();
    openSettingsWindow();
  });

  document.addEventListener('settingsModalClosed', () => {
    init();
  });

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
});
