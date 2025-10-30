// custom-hooks.js  (v4)
(function () {
  console.log('[custom-hooks] CARGADO');

  // Utils
  const doc = document;
  const sc = doc.scrollingElement || doc.documentElement;

  const atBottom = () =>
    sc.scrollHeight - sc.scrollTop - sc.clientHeight <= 2;

  const lockedCount = () => {
    // Intenta cubrir los estados que usa Rise para bloquear
    return doc.querySelectorAll(
      '[data-state="locked"], .is-locked, [aria-disabled="true"]'
    ).length;
  };

  let posted = false;

  function maybeComplete() {
    if (posted) return;
    const noneLocked = lockedCount() === 0;
    const bottom = atBottom();
    // Solo completa cuando ya no hay nada bloqueado y realmente se ha llegado al final
    if (noneLocked && bottom) {
      posted = true;
      console.log('[custom-hooks] postMessage -> WEB_LESSON_DONE');
      window.parent.postMessage({ type: 'WEB_LESSON_DONE' }, '*');
      window.removeEventListener('scroll', onScroll, { passive: true });
      if (mo) mo.disconnect();
    }
  }

  const onScroll = () => requestAnimationFrame(maybeComplete);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Observa cambios de DOM (cuando se desbloquean bloques, cambian alturas, etc.)
  const mo = new MutationObserver(() => {
    // Pequeño debounce natural via RAF
    requestAnimationFrame(maybeComplete);
  });
  mo.observe(doc.body, { childList: true, subtree: true, attributes: true });

  // Primer chequeo (por si se entra ya al final)
  requestAnimationFrame(maybeComplete);
})();

