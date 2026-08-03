if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" })
      .catch(() => {
        // Die Übersicht bleibt nutzbar; nur der Offline-Cache fehlt in diesem Fall.
      });
  });
}
