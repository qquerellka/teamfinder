import "@telegram-apps/telegram-ui/dist/styles.css";
import "./styles/index.css";
import "./styles/reset.css";

import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { retrieveLaunchParams } from "@tma.js/sdk-react";

import { init } from "@/app/init";
import { App } from "./App";
import { EnvUnsupported } from "@/app/EnvUnsupported";

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
      <App str="" />
    </StrictMode>
  );
}

// ---------- TMA (prod) ----------

async function bootstrapTMA() {
  const lp = retrieveLaunchParams();

  const a = new URLSearchParams(location.hash.slice(1)).get("tgWebAppData")
    || new URLSearchParams(location.search).get("tgWebAppData")
  const debug =
    (lp.tgWebAppStartParam || "").includes("debug") || import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ["ios", "android"].includes(lp.tgWebAppPlatform),
    mockForMacOS: false,

  });

  root.render(
    <StrictMode>
      <App str={a ?? ""} />
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
  }
   catch (e) {
    console.error(e);
    root.render(<EnvUnsupported />);
  }
})();

