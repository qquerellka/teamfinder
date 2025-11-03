const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-PRySoXEY.js","assets/index-CAhzXg4V.js","assets/index-D-bDv5Dk.css","assets/hackathonImage6-C-Bujif0.js"])))=>i.map(i=>d[i]);
import{j as e,R as t,d as i,_ as s,p as a,L as n}from"./index-CAhzXg4V.js";import{C as o,h as r,a as c,f as l,b as d,c as x,d as p,e as h,g as m,i as j}from"./hackathonImage6-C-Bujif0.js";const g=i=>e.jsx(o,{children:e.jsxs(t.Fragment,{children:[e.jsx("img",{alt:i.name,src:r,style:{display:"block",objectFit:"cover",width:"100%",height:"100%"}}),e.jsx(c,{style:{fontSize:"24px",lineHeight:"28px"},readOnly:!0,subtitle:e.jsx(f,{...i}),children:i.name})]},".0")}),f=t=>{const i=[{icon:d,text:l(t.startDate,t.endDate)},{icon:p,text:x(t.registrationEndDate)},{icon:h,text:`${t.city} • ${t.mode}`},{icon:m,text:t.prizeFund.toLocaleString()}];return e.jsx(y,{children:i.map(({icon:t,text:i},s)=>e.jsxs(u,{children:[e.jsx("img",{src:t,alt:i}),e.jsx("span",{children:i})]},s))})},y=i.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,u=i.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
`,_=()=>e.jsx(b,{children:j.map(t=>e.jsx(k,{to:a.hackathon(t.id),onMouseEnter:()=>s(()=>import("./HackathonPage-PRySoXEY.js"),__vite__mapDeps([0,1,2,3])),children:e.jsx(g,{...t},t.id)},t.id))}),b=i.section`
  display: grid;
  gap: 12px;
`,k=i(n)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{_ as HackathonsPage,_ as default};
