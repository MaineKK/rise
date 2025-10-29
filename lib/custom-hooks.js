// Engancha SIEMPRE al ÚLTIMO "Continuar" visible en el documento.
// Sólo envía DONE cuando, tras pulsarlo, ya no quedan más "Continuar" en la página.
(function () {
  const TYPE_A = "WEB_LESSON_DONE";
  const TYPE_B = "riseAllBlocksDone";

  let observedBtn = null;
  let mo = null;

  const looksLikeContinue = (el) => {
    if (!el) return false;
    // Sólo botones/enlaces
    const tag = (el.tagName || "").toLowerCase();
    if (!(tag === "button" || tag === "a") && el.getAttribute("role") !== "button") return false;

    const txt = (el.textContent || "").trim().toLowerCase();
    // Palabras típicas de Rise/ES
    return /continuar|siguiente|next|continue/.test(txt);
  };

  const getY = (el) => {
    const r = el.getBoundingClientRect();
    return r.top + (window.scrollY || document.documentElement.scrollTop || 0);
  };

  const scanCandidates = () => {
    const nodes = Array.from(document.querySelectorAll("button, a, [role='button']"))
      .filter(looksLikeContinue)
      // Evitar botones deshabilitados/ocultos
      .filter((el) => {
        const s = window.getComputedStyle(el);
        if (s.visibility === "hidden" || s.display === "none") return false;
        if (el.disabled) return false;
        return true;
      });

    // Ordena por posición vertical y coge el MÁS BAJO (último)
    nodes.sort((a, b) => getY(a) - getY(b));
    return nodes;
  };

  const sendDone = () => {
    console.log("[custom-hooks] DONE → Storyline");
    try { window.parent.postMessage({ type: TYPE_A }, "*"); } catch {}
    try { window.parent.postMessage({ type: TYPE_B }, "*"); } catch {}
    cleanup();
  };

  const rehook = () => {
    const all = scanCandidates();
    const newBottom = all.length ? all[all.length - 1] : null;

    if (observedBtn === newBottom) return; // ya estamos en el último
    if (observedBtn) {
      observedBtn.removeEventListener("click", onBottomClick, true);
    }
    observedBtn = newBottom;

    if (observedBtn) {
      console.log("[custom-hooks] Enganchado al ÚLTIMO 'Continuar'");
      observedBtn.addEventListener("click", onBottomClick, true);
    } else {
      // No hay más "Continuar" en la página → probablemente ya está completa
      // (esto puede pasar tras expandir el último)
      console.log("[custom-hooks] No hay más 'Continuar' → marcar como completo");
      sendDone();
    }
  };

  const onBottomClick = (ev) => {
    // Esperamos a que Rise expanda el contenido y muten los nodos
    setTimeout(() => {
      const allAfter = scanCandidates();
      if (allAfter.length === 0) {
        // Ya no queda ningún "Continuar" → era el último de verdad
        sendDone();
      } else {
        // Apareció otro “Continuar” más abajo → reenganchar al nuevo último
        rehook();
      }
    }, 250);
  };

  const init = () => {
    // Observa cambios del DOM para reenganchar al último si aparece uno más abajo
    mo = new MutationObserver(() => {
      // Pequeño debounce
      if (init._t) cancelAnimationFrame(init._t);
      init._t = requestAnimationFrame(rehook);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    rehook();
    console.log("[custom-hooks] Hook 'último Continuar' activo");
  };

  const cleanup = () => {
    try { mo && mo.disconnect(); } catch {}
    try { observedBtn && observedBtn.removeEventListener("click", onBottomClick, true); } catch {}
  };

  // Arrancar
  init();
})();


