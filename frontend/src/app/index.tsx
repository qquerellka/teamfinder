import "@telegram-apps/telegram-ui/dist/styles.css";
import "./styles/index.css";
import "./styles/reset.css";

import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { retrieveLaunchParams } from "@tma.js/sdk-react";

import { init } from "@/app/init";
import { App } from "./App";
import { EnvUnsupported } from "@/app/EnvUnsupported";
import { resolveInitDataRaw } from "@/shared/resolveInitDataRow";

if (import.meta.env.DEV) {
  await import("./mocks/mockEnv");
}

const root = ReactDOM.createRoot(document.getElementById("root")!);

const isTMA = !!window.Telegram?.WebApp;
const FORCE_BROWSER = import.meta.env.VITE_FORCE_BROWSER === "true";

// ---------- БРАУЗЕР (dev) ----------

async function bootstrapBrowser() {
  const debug = true;

  await init({
    debug,
    eruda: false,
    mockForMacOS: true,
  });

  root.render(
    <StrictMode>
      <App str="" />
    </StrictMode>
  );
}


// ---------- TMA (prod) ----------

async function bootstrapTMA() {
  const lp = retrieveLaunchParams();
  const raw = resolveInitDataRaw();

  console.log("[LP] platform:", lp.tgWebAppPlatform);
  console.log("[LP] from SDK:", lp.initDataRaw);
  console.log("[RAW] from TG:", window.Telegram?.WebApp?.initData);
  console.log(
    "[RAW] from URL:",
    new URLSearchParams(location.hash.slice(1)).get("tgWebAppData") ||
      new URLSearchParams(location.search).get("tgWebAppData")
  );
  console.log("[RESOLVED] initDataRaw:", raw);

  const debug =
    (lp.tgWebAppStartParam || "").includes("debug") || import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ["ios", "android"].includes(lp.tgWebAppPlatform),
    mockForMacOS: false,

  });

  root.render(
    <StrictMode>
      <App str={raw ?? ""} />
    </StrictMode>
  );
}

// ---------- ЕДИНАЯ ТОЧКА ВХОДА ----------

(async () => {
  try {
    if (!isTMA || FORCE_BROWSER || import.meta.env.DEV) {
      await bootstrapBrowser();
    } else {
      await bootstrapTMA();
    }
  } catch (e) {
    console.error(e);
    root.render(<EnvUnsupported />);
  }
})();

