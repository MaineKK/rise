// Detecta botón "Continuar" de Rise y avisa a Storyline
(function () {
  const TYPE_A = "WEB_LESSON_DONE";      // tipo actual
  const TYPE_B = "riseAllBlocksDone";    // compat básico

  const sendDone = () => {
    console.log("[custom-hooks] Enviando DONE → Storyline");
    try { window.parent.postMessage({ type: TYPE_A }, "*"); } catch {}
    try { window.parent.postMessage({ type: TYPE_B }, "*"); } catch {}
    cleanup();
  };

  const looksLikeContinue = (el) => {
    if (!el) return false;
    const t = (el.textContent || "").trim().toLowerCase();
    return /continuar|siguiente|next|continue/.test(t);
  };

  let observedBtn = null;

  const onSeeBtn = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.target === observedBtn && en.isIntersecting) {
        console.log("[custom-hooks] Botón Continuar VISIBLE → desbloquear Next");
        sendDone();
      }
    });
  }, { root: null, threshold: 0.6 });

  const hookBtn = (btn) => {
    if (observedBtn === btn) return;
    observedBtn = btn;
    console.log("[custom-hooks] Detectado botón Continuar");
    btn.addEventListener("click", sendDone, { once: true });
    onSeeBtn.observe(btn);
  };

  const scan = () => {
    const candidates = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const btn = candidates.find(looksLikeContinue);
    if (btn) hookBtn(btn);
  };

  const mo = new MutationObserver(scan);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  scan(); // primer intento

  function cleanup() {
    try { mo.disconnect(); } catch {}
    try { onSeeBtn.disconnect(); } catch {}
    if (observedBtn) observedBtn.removeEventListener("click", sendDone);
  }

  console.log("[custom-hooks] Hook Continuar activo");
})();


