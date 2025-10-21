import { showFeedback, loadGlobalTheme, checkAuth, initNavigation, setupLanguageSwitcher } from "./shared/shared.js";

async function initPage() {
  const authStatus = await checkAuth();
  if (authStatus && authStatus.success) {
    loadMarkdownEditor();
    loadTechnologies();
  } else if (!authStatus || !authStatus.success) {
    window.location.href = "index.html";
    return;
  }
  initNavigation("add-command.html", authStatus);
}

initPage();

//desc: initiales laden des contents, theme wird geladen und alle technologien
let markdownDescription;

loadGlobalTheme();
setupLanguageSwitcher();

function loadMarkdownEditor() {
  markdownDescription = new EasyMDE({
    element: document.getElementById('description'),
    spellChecker: false,
    status: false,
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview", "guide"]
  });
  markdownDescription.value('');
}

//desc: eventlistener auf den form button zum eintragen eines neuen commands
document.getElementById('add-command-btn').addEventListener('click', async (event) => {
  event.preventDefault();
  markdownDescription.toTextArea();
  const tech = document.getElementById('tech');
  const title = document.getElementById('title');
  const command = document.getElementById('command');
  const description = document.getElementById('description');
  const source = document.getElementById('source');

  try {
    const response = await fetch("/api/commands/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category_id: tech.value,
        cmd_title: title.value,
        cmd: command.value,
        cmd_description: description.value,
        cmd_source: source.value
      })
    });
    const result = await response.json();
    if (result.success) {
      showFeedback({ success: true, message: `${window.i18n.translate("pages.addCommand.messages.cmdSaved")}` });
      document.getElementById('add-command-form').reset();
      loadMarkdownEditor()
    }
  } catch (error) {
    console.error('Datenbank Fehler:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.addCommand.messages.cmdSaveError")}` });
  }
});

//desc: um das form zu resetten
document.getElementById('reset-btn').addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('add-command-form').reset();
  markdownDescription.value('');
});

//desc: lädt alle technologien aus der db und füllt den select tag mit den technologien
async function loadTechnologies() {
  try {
    const response = await fetch('/api/categories/all')
    const result = await response.json();
    const technologies = result.data;
    const techOptions = document.getElementById('tech-options');
    if (technologies.length < 1) {
      techOptions.innerHTML = `<span class="me-4 text-primary">${window.i18n.translate("pages.addCommand.form.noTechPlaceholder")}</span>`;
      return;
    }
    techOptions.innerHTML = '';
    const techSelect = document.createElement('select');
    techSelect.className = 'form-select-lg form-select bg-dark border-secondary text-primary';
    techSelect.id = 'tech';
    techSelect.required = true;
    techOptions.appendChild(techSelect);
    technologies.forEach(tech => {
      const option = document.createElement('option');
      option.value = tech.category_id;
      option.textContent = tech.category_name;
      techSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
  }
}
