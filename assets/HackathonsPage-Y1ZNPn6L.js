const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-Bg_yhsVc.js","assets/index-BP6m3LsH.js","assets/index-C0UY9JoW.css","assets/HackathonCard-BbvSeMpr.js","assets/STitle-dMqy30R5.js","assets/Subheadline-BvWdV3no.js"])))=>i.map(i=>d[i]);
import{j as a,_ as o,p as t,d as s,L as i}from"./index-BP6m3LsH.js";import{h as e,H as r}from"./HackathonCard-BbvSeMpr.js";import"./STitle-dMqy30R5.js";import"./Subheadline-BvWdV3no.js";const n=()=>a.jsx(d,{children:e.map(s=>a.jsx(p,{to:t.hackathon(s.id),onMouseEnter:()=>o(()=>import("./HackathonPage-Bg_yhsVc.js"),__vite__mapDeps([0,1,2,3,4,5])),children:a.jsx(r,{hackathon:s,type:"part"},s.id)},s.id))}),d=s.section`
  display: grid;
  gap: 12px;
`,p=s(i)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{n as HackathonsPage,n as default};
