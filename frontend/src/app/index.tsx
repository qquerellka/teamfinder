import "@telegram-apps/telegram-ui/dist/styles.css";
import "./styles/index.css";
import "./styles/reset.css";

import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { retrieveLaunchParams } from "@tma.js/sdk-react";

import { init } from "@/app/init";
import { App } from "./App";
import { EnvUnsupported } from "@/app/EnvUnsupported";
import { setInitDataRaw } from "@/shared/initDataStore";

const FORCE_BROWSER = import.meta.env.VITE_FORCE_BROWSER === "true";

if (import.meta.env.DEV || FORCE_BROWSER) {
  await import("./mocks/mockEnv");
}

const root = ReactDOM.createRoot(document.getElementById("root")!);

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
      <App />
    </StrictMode>
  );
}

// ---------- TMA (prod) ----------

async function bootstrapTMA() {
  // 1) Явно описываем то, что нам нужно из launch params
  const lp = retrieveLaunchParams() as {
    initDataRaw?: string;
    initData?: string;
    tgWebAppStartParam?: string;
    tgWebAppPlatform?: string;
  };

  const a =
    new URLSearchParams(location.hash.slice(1)).get("tgWebAppData") ||
    new URLSearchParams(location.search).get("tgWebAppData");

  // 2) Жёстко задаём тип initDataRaw как string | undefined
  const initDataRaw: string | undefined =
    lp.initDataRaw ??
    lp.initData ??
    (window?.Telegram?.WebApp?.initData as string | undefined) ??
    (a ? decodeURIComponent(a) : undefined);

  setInitDataRaw(initDataRaw);

  const debug =
    (lp.tgWebAppStartParam || "").includes("debug") || import.meta.env.DEV;

  await init({
    debug,
    // eruda: debug && ["ios", "android"].includes(lp.tgWebAppPlatform || ""),
    eruda: true,
    mockForMacOS: false,
  });

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// ---------- ЕДИНАЯ ТОЧКА ВХОДА ----------

(async () => {
  try {
    if (FORCE_BROWSER || import.meta.env.DEV) {
      await bootstrapBrowser();
    } else {
      await bootstrapTMA();
    }
  } catch (e) {
    console.error(e);
    root.render(<EnvUnsupported />);
  }
})();
