// Review controls: Current / Proposed / Side by side, light / dark, notes and pins.
// Choices persist per browser so moving between pages keeps the same view.
(function () {
  const store = {
    get(k, d) { try { return localStorage.getItem('jm-' + k) || d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('jm-' + k, v); } catch { /* private mode */ } },
  };

  function apply() {
    const show = store.get('show', 'proposed');
    const theme = store.get('theme', 'light');
    const notes = store.get('notes', 'on');
    document.body.dataset.show = show;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('hide-pins', notes !== 'on' || show === 'current');
    document.querySelectorAll('.review-layout').forEach((el) => el.classList.toggle('no-notes', notes !== 'on'));
    document.querySelectorAll('[data-set]').forEach((b) => {
      const [k, v] = b.dataset.set.split(':');
      b.setAttribute('aria-pressed', String(store.get(k, k === 'show' ? 'proposed' : k === 'theme' ? 'light' : 'on') === v));
    });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set]');
    if (!b) return;
    const [k, v] = b.dataset.set.split(':');
    store.set(k, v);
    apply();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'c') store.set('show', 'current');
    else if (e.key === 'p') store.set('show', 'proposed');
    else if (e.key === 's') store.set('show', 'split');
    else if (e.key === 'd') store.set('theme', store.get('theme', 'light') === 'dark' ? 'light' : 'dark');
    else return;
    apply();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
