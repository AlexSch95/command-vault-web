import { loadGlobalTheme, showFeedback, initNavigation, checkAuth } from "./shared/shared.js";


async function initPage() {
  const authStatus = await checkAuth();
  initNavigation("index.html", authStatus);
}

initPage();

await loadGlobalTheme();

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
