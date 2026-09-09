const tabs = [...document.querySelectorAll('[data-preview-tab]')];
function selectTab(index) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  document.querySelectorAll('[data-preview-panel]').forEach((panel, i) => { panel.hidden = i !== index; });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); selectTab(next); tabs[next].focus();
  });
});
const toggle = document.querySelector('[aria-label="Toggle menu"]');
if (toggle) {
  const menu = document.createElement('nav');
  menu.id = 'preview-mobile-navigation';
  menu.className = 'preview-mobile-menu';
  menu.setAttribute('aria-label', 'Mobile navigation');
  menu.hidden = true;
  document.querySelectorAll('header a').forEach(link => {
    if (link.textContent.trim()) menu.append(link.cloneNode(true));
  });
  toggle.closest('header').append(menu);
  toggle.setAttribute('aria-controls', menu.id);
  toggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
  });
}
