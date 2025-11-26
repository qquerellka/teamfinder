import "@telegram-apps/telegram-ui/dist/styles.css";
import "./styles/index.css";
import "./styles/reset.css";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { retrieveLaunchParams } from "@tma.js/sdk-react";
import { initData } from "@tma.js/sdk";

import { EnvUnsupported } from "@/app/EnvUnsupported.tsx";
import { init } from "@/app/init.ts";

import "./mocks/mockEnv.ts";
import { App } from "./App.tsx";

const root = ReactDOM.createRoot(document.getElementById("root")!);

try {
  const launchParams = retrieveLaunchParams();
  const { initDataRaw } = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  console.log(initDataRaw);
  const initDataString = initData.raw();

  

  const debug =
    (launchParams.tgWebAppStartParam || "").includes("debug") ||
    import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ["ios", "android"].includes(platform),
    mockForMacOS: platform === "macos",
  }).then(() => {
    root.render(
      <StrictMode>
        <App str={initDataString} />
      </StrictMode>
    );
  });
} catch (e) {
  root.render(<EnvUnsupported />);
}
// import ReactDOM from "react-dom/client";
// import { StrictMode } from "react";
// import { retrieveLaunchParams } from "@tma.js/sdk-react";
// import { init } from "@/app/init";
// import { App } from "./App";
// import { EnvUnsupported } from "@/app/EnvUnsupported";
// import { resolveInitDataRaw } from "../shared/resolveInitDataRow";

// const root = ReactDOM.createRoot(document.getElementById("root")!);

// try {
//   const lp = retrieveLaunchParams();
//   const raw = resolveInitDataRaw();

//   console.log("[LP] platform:", lp.tgWebAppPlatform);
//   console.log("[LP] from SDK:", lp.initDataRaw);
//   console.log("[RAW] from TG:", (window as any)?.Telegram?.WebApp?.initData);
//   console.log("[RAW] from URL:", new URLSearchParams(location.hash.slice(1)).get("tgWebAppData")
//     || new URLSearchParams(location.search).get("tgWebAppData"));
//   console.log("[RESOLVED] initDataRaw:", raw);
//   const a = new URLSearchParams(location.hash.slice(1)).get("tgWebAppData")
//     || new URLSearchParams(location.search).get("tgWebAppData")
//   const debug =
//     (lp.tgWebAppStartParam || "").includes("debug") || import.meta.env.DEV;

//   await init({
//     debug,
//     eruda: debug && ["ios", "android"].includes(lp.tgWebAppPlatform),
//     mockForMacOS: false
//   });

//   root.render(
//     <StrictMode>
//       <App str={a ?? ""} />
//     </StrictMode>
//   );
// } catch (e) {
//   console.error(e);
//   root.render(<EnvUnsupported />);
// }
