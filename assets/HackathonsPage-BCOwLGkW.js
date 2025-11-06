const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-C2Y9gHNm.js","assets/index-B0MgUN_p.js","assets/HackathonCard-CSmUg8PF.js","assets/STitle-DZuXkmyI.js","assets/Subheadline-BxW9TNHg.js"])))=>i.map(i=>d[i]);
import{j as a,_ as o,p as t,d as s,L as i}from"./index-B0MgUN_p.js";import{h as e,H as r}from"./HackathonCard-CSmUg8PF.js";import"./STitle-DZuXkmyI.js";import"./Subheadline-BxW9TNHg.js";const n=()=>a.jsx(d,{children:e.map(s=>a.jsx(p,{to:t.hackathon(s.id),onMouseEnter:()=>o(()=>import("./HackathonPage-C2Y9gHNm.js"),__vite__mapDeps([0,1,2,3,4])),children:a.jsx(r,{hackathon:s,type:"part"},s.id)},s.id))}),d=s.section`
  display: grid;
  gap: 12px;
`,p=s(i)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{n as HackathonsPage,n as default};
