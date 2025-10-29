// Detecta desbloqueo de contenido + llegada al final → avisa a Storyline
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    function getScroller() {
      const cand = [
        document.getElementById('app'),
        document.scrollingElement,
        document.documentElement,
        document.body
      ].filter(Boolean);

      for (const el of cand) {
        if (el.scrollHeight > el.clientHeight + 5) return el;
      }
      return document.scrollingElement || document.documentElement;
    }

    let sc = getScroller();
    let expanded = false;
    let userScrolled = false;

    function atBottom() {
      return sc.scrollHeight - sc.scrollTop - sc.clientHeight <= 2;
    }

    function notifyIfReady() {
      if (expanded && userScrolled && atBottom()) {
        window.parent.postMessage({ type: "WEB_LESSON_DONE" }, "*");
        if (observer) observer.disconnect();
        sc.removeEventListener("scroll", onScroll);
      }
    }

    const onScroll = () => {
      if (!expanded) return;
      userScrolled = true;
      requestAnimationFrame(notifyIfReady);
    };

    sc.addEventListener("scroll", onScroll, { passive: true });

    let lastHeight = sc.scrollHeight;
    const observer = new MutationObserver(() => {
      const newSc = getScroller();
      if (newSc !== sc) {
        sc.removeEventListener("scroll", onScroll);
        sc = newSc;
        sc.addEventListener("scroll", onScroll, { passive: true });
      }

      const newHeight = sc.scrollHeight;
      if (newHeight > lastHeight + 10) {
        expanded = true;
        requestAnimationFrame(notifyIfReady);
      }
      lastHeight = newHeight;
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
