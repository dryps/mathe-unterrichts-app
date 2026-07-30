import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const port = 4183;
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});

const expectedFiles = [
  "/",
  "/home.css",
  "/navigation.css",
  "/src/shell.js",
  "/winkelsumme.html",
  "/styles.css",
  "/src/app.js",
  "/src/geometry.js",
  "/dreiecksungleichung.html",
  "/triangle-inequality.css",
  "/src/triangle-inequality-app.js",
  "/src/triangle-inequality-geometry.js",
  "/dreiecksflaeche.html",
  "/triangle-area.css",
  "/src/triangle-area-app.js",
  "/src/triangle-area-animation.js",
  "/src/triangle-area-geometry.js",
  "/src/triangle-area-state.js",
  "/sw.js",
  "/manifest.webmanifest",
  "/icon.svg",
];

try {
  await wait(250);
  for (const path of expectedFiles) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    if (!response.ok) {
      throw new Error(`${path} antwortete mit ${response.status}`);
    }
    if ((await response.arrayBuffer()).byteLength === 0) {
      throw new Error(`${path} ist leer`);
    }
  }
  console.log(`${expectedFiles.length}/${expectedFiles.length} lokale App-Ressourcen erreichbar`);
} finally {
  server.kill("SIGTERM");
}
