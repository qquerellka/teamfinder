const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-Dm7lkTJy.js","assets/index-CTj-vRYs.js","assets/index-D-bDv5Dk.css","assets/date-C0PWPuzU.js","assets/hackathonImage6-shJ4JQ9w.js"])))=>i.map(i=>d[i]);
import{j as e,R as t,d as i,_ as s,p as a,L as n}from"./index-CTj-vRYs.js";import{C as o,a as r,f as c,h as l,b as d,c as x,d as p,e as h,g as m}from"./date-C0PWPuzU.js";import{h as j}from"./hackathonImage6-shJ4JQ9w.js";const g=i=>e.jsx(o,{children:e.jsxs(t.Fragment,{children:[e.jsx("img",{alt:i.name,src:j,style:{display:"block",objectFit:"cover",width:"100%",height:"100%"}}),e.jsx(r,{style:{fontSize:"24px",lineHeight:"28px"},readOnly:!0,subtitle:e.jsx(f,{...i}),children:i.name})]},".0")}),f=t=>{const i=[{icon:l,text:c(t.startDate,t.endDate)},{icon:x,text:d(t.registrationEndDate)},{icon:p,text:`${t.city} • ${t.mode}`},{icon:h,text:t.prizeFund.toLocaleString()}];return e.jsx(y,{children:i.map(({icon:t,text:i},s)=>e.jsxs(u,{children:[e.jsx("img",{src:t,alt:i}),e.jsx("span",{children:i})]},s))})},y=i.section`
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
`,_=()=>e.jsx(b,{children:m.map(t=>e.jsx(k,{to:a.hackathon(t.id),onMouseEnter:()=>s(()=>import("./HackathonPage-Dm7lkTJy.js"),__vite__mapDeps([0,1,2,3,4])),children:e.jsx(g,{...t},t.id)},t.id))}),b=i.section`
  display: grid;
  gap: 12px;
`,k=i(n)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{_ as HackathonsPage,_ as default};
