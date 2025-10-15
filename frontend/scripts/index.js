import { loadGlobalTheme } from ".shared/shared.js";

document.addEventListener("DOMContentLoaded", async () => {

  loadGlobalTheme();
  
  if (window.i18n) {
    await window.i18n.ready;
  }


  const modal = new bootstrap.Modal(document.getElementById('gettingStartedModal'), {
    backdrop: false,
    keyboard: true
  });

  document.getElementById("settingsButton").addEventListener("click", () => {
    document.getElementById("mainContentOverlay").classList.add("overlay-darken");
    window.electronAPI.openSettingsWindow();
  });

  window.electronAPI.onSettingsClosed(() => {
    document.getElementById("mainContentOverlay").classList.remove("overlay-darken");
    loadGlobalTheme();
  });

  document.getElementById("minimize-btn").addEventListener("click", () => {
    window.electronAPI.minimizeWindow();
  });
  document.getElementById("close-btn").addEventListener("click", () => {
    window.electronAPI.closeWindow();
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
