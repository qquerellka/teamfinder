const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HackathonPage-Ta6pQkY1.js","assets/index-CJxBPDgX.js","assets/index-D-bDv5Dk.css","assets/hackathons-D74nN5fZ.js","assets/hackathonImage6-shJ4JQ9w.js"])))=>i.map(i=>d[i]);
import{j as e,T as a,d as i,_ as t,p as r,L as s}from"./index-CJxBPDgX.js";import{h as o}from"./hackathonImage6-shJ4JQ9w.js";import{f as n,h as d,a as c,b as l,c as m,d as h,C as p,e as x}from"./hackathons-D74nN5fZ.js";const g=["/teamfinder/assets/download-BZzLZBnf.jpeg","/teamfinder/assets/hackathonImage8-aTSIG1ph.webp",o,"/teamfinder/assets/hackathonImage4-_p73mbel.webp","/teamfinder/assets/hackathonImage9-DMpyzT_x.png"],f=({id:i,name:t,startDate:r,endDate:s,registrationEndDate:o,city:p,mode:x,prizeFund:f})=>{const w=[{icon:d,text:n(r,s)},{icon:l,text:c(o)},{icon:m,text:`${p} • ${x}`},{icon:h,text:f.toLocaleString()}];return e.jsxs(j,{children:[e.jsx(b,{children:e.jsx("img",{src:g[i%5],alt:t})}),e.jsxs(k,{children:[e.jsx(a,{weight:"2",children:t}),e.jsx(y,{children:w.map(({icon:a,text:i},t)=>e.jsxs(v,{children:[e.jsx("img",{src:a,alt:i}),e.jsx(u,{level:"2",weight:"3",children:i})]},t))})]})]},i)},j=i(p)`
  background: var(--tg-theme-section-bg-color, #fff);
  border-radius: 1rem;
  padding: 0rem 0rem 1rem 0rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 1.5rem;
`,b=i.div`
  /* position: relative;
  overflow: hidden; */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`,k=i.div`
  margin: 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`,u=i(a)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
  line-height: normal;
`,v=i.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`,y=i.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,w=()=>e.jsx(_,{children:x.map(a=>e.jsx(I,{to:r.hackathon(a.id),onMouseEnter:()=>t(()=>import("./HackathonPage-Ta6pQkY1.js"),__vite__mapDeps([0,1,2,3,4])),children:e.jsx(f,{...a},a.id)},a.id))}),_=i.section`
  display: grid;
  gap: 12px;
`,I=i(s)`
  display: block;
  text-decoration: none;
  color: inherit;
`;export{w as HackathonsPage,w as default};
