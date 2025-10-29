(function () {
  console.log("[custom-hooks] CARGÓ el archivo");

  function safeGetScrollingElement() {
    return document.scrollingElement || document.documentElement || document.body;
  }

  function detectExpansion(callback) {
    const sc = safeGetScrollingElement();
    let lastHeight = sc.scrollHeight;
    console.log("[custom-hooks] Altura inicial:", lastHeight);

    const obs = new MutationObserver(() => {
      const h = sc.scrollHeight;
      if (h > lastHeight + 20) {
        console.log("[custom-hooks] Contenido EXPANDIDO ->", h);
        lastHeight = h;
        callback();
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      const h2 = sc.scrollHeight;
      if (h2 > lastHeight + 20) {
        console.log("[custom-hooks] EXPANSIÓN detectada al cargar ->", h2);
        lastHeight = h2;
        callback();
      }
    }, 400);
  }

  function notifyStoryline() {
    console.log("[custom-hooks] Enviando WEB_LESSON_DONE");
    window.parent?.postMessage({ type: "WEB_LESSON_DONE" }, "*");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => detectExpansion(notifyStoryline));
  } else {
    detectExpansion(notifyStoryline);
  }
})();

