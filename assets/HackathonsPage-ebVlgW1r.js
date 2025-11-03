const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-Ci_Lh169.js","assets/index-7qL5cUQP.js","assets/index-D-bDv5Dk.css","assets/hackathonImage6-CDRMpL0m.js"])))=>i.map(i=>d[i]);
import{j as e,R as t,d as i,_ as s,p as a,L as n}from"./index-7qL5cUQP.js";import{C as o,h as r,a as l,f as c,b as d,c as x,d as p,e as h}from"./hackathonImage6-CDRMpL0m.js";const m=i=>e.jsx(o,{children:e.jsxs(t.Fragment,{children:[e.jsx("img",{alt:i.name,src:r,style:{display:"block",objectFit:"cover",width:"100%",height:"100%"}}),e.jsx(l,{style:{fontSize:"24px",lineHeight:"28px"},readOnly:!0,subtitle:e.jsx(j,{...i}),children:i.name})]},".0")}),j=t=>{const i=[{icon:d,text:c(t.startDate,t.endDate)},{icon:x,text:`${t.city} • ${t.mode}`},{icon:p,text:t.prizeFund.toLocaleString()}];return e.jsx(g,{children:i.map(({icon:t,text:i},s)=>e.jsxs(f,{children:[e.jsx("img",{src:t,alt:i}),e.jsx("span",{children:i})]},s))})},g=i.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,f=i.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
`,y=()=>e.jsx(u,{children:h.map(t=>e.jsx(_,{to:a.hackathon(t.id),onMouseEnter:()=>s(()=>import("./HackathonPage-Ci_Lh169.js"),__vite__mapDeps([0,1,2,3])),children:e.jsx(m,{...t},t.id)},t.id))}),u=i.section`
  display: grid;
  gap: 12px;
`,_=i(n)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{y as HackathonsPage,y as default};
