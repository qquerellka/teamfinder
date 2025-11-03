const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-NMHMlFFm.js","assets/index-Ce4q5plM.js","assets/index-D-bDv5Dk.css","assets/hackathonImage6-C5F62q_a.js"])))=>i.map(i=>d[i]);
import{j as e,R as t,d as s,_ as i,p as n,L as a}from"./index-Ce4q5plM.js";import{C as r,h as c,a as o,f as l,b as x,c as d,d as h,e as j,g as p,i as m}from"./hackathonImage6-C5F62q_a.js";const g=s=>e.jsx(r,{children:e.jsxs(t.Fragment,{children:[e.jsx("img",{alt:s.name,src:c,style:{display:"block",objectFit:"cover",width:"100%",height:"100%"}}),e.jsx(o,{style:{fontSize:"24px",lineHeight:"28px"},readOnly:!0,subtitle:e.jsx(f,{...s}),children:s.name})]},".0")}),f=t=>{const s=[{icon:x,text:l(t.startDate,t.endDate)},{icon:h,text:d(t.registrationEndDate)},{icon:j,text:`${t.city} • ${t.mode}`},{icon:p,text:t.prizeFund.toLocaleString()}];return e.jsxs(y,{children:[e.jsxs(u,{children:[e.jsx("img",{src:s[0].icon,alt:s[0].text}),e.jsx("span",{children:s[0].text})]}),e.jsxs(u,{children:[e.jsx("img",{src:s[0].icon,alt:s[0].text}),e.jsx("span",{children:s[0].text})]}),e.jsxs(u,{children:[e.jsx("img",{src:s[0].icon,alt:s[0].text}),e.jsx("span",{children:s[0].text})]}),e.jsxs(u,{children:[e.jsx("img",{src:s[0].icon,alt:s[0].text}),e.jsx("span",{children:s[0].text})]})]})},y=s.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,u=s.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
`,_=()=>e.jsx(b,{children:m.map(t=>e.jsx(k,{to:n.hackathon(t.id),onMouseEnter:()=>i(()=>import("./HackathonPage-NMHMlFFm.js"),__vite__mapDeps([0,1,2,3])),children:e.jsx(g,{...t},t.id)},t.id))}),b=s.section`
  display: grid;
  gap: 12px;
`,k=s(a)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{_ as HackathonsPage,_ as default};
