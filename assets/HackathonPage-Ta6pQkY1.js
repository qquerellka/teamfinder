import{a as e,j as t,b as a,c as s,S as i,r as n,u as r,e as c,f as d,h as o,i as l,k as f,R as h,d as g,l as m,N as x}from"./index-CJxBPDgX.js";import{C as p,g as u,f as j,h as b,a as y,b as w,c as k,d as v,e as z}from"./hackathons-D74nN5fZ.js";import{h as N}from"./hackathonImage6-shJ4JQ9w.js";const C=n=>{var{size:r}=n,c=e(n,["size"]);return"l"===r?t.jsx(a,s({weight:"2"},c)):t.jsx(i,s({level:"2",weight:"2"},c))},L={filled:"tgui-8a1ca9efa24f4809",bezeled:"tgui-91bda9a36246a33c",plain:"tgui-48956537c34690db",gray:"tgui-93106efd6b6d66ee",outline:"tgui-e884e36ff1faa596",white:"tgui-ba6d30cc81e39ae5"},S={s:"tgui-13f23a224303ddaa",m:"tgui-1a16a49d89076ff4",l:"tgui-9cef742a22f195c9"},D=n.forwardRef((a,i)=>{var{type:n,size:h="m",before:g,after:m,stretched:x,children:p,className:u,mode:j="filled",loading:b,Component:y="button"}=a,w=e(a,["type","size","before","after","stretched","children","className","mode","loading","Component"]);const k=r();return t.jsxs(c,d(s({ref:i,type:n||"button",Component:y,className:f("tgui-117e77cd385a9c8d",j&&L[j],h&&S[h],"ios"===k&&"tgui-55e8aa7f5cea2280",x&&"tgui-726846958fe7f4a0",b&&"tgui-490cb0f5ec4998f3",u)},w),{children:[b&&t.jsx(l,{className:"tgui-014f2b7d196b090d",size:"s"}),o(g)&&t.jsx("div",{className:"tgui-06cc94d03a7c4dd7",children:g}),t.jsx(C,{className:"tgui-5f6014c0f063b6de",size:h,children:p}),o(m)&&t.jsx("div",{className:"tgui-8310172a5320ab71",children:m})]}))}),F=e=>t.jsx(p,{children:t.jsxs(h.Fragment,{children:[t.jsx("img",{alt:e.name,src:N,style:{display:"block",objectFit:"cover",width:"100%",height:"100%"}}),t.jsx(u,{style:{fontSize:"24px",lineHeight:"28px"},readOnly:!0,subtitle:t.jsx(W,{...e}),children:e.name})]},".0")}),W=e=>{const a=[{icon:b,text:j(e.startDate,e.endDate)},{icon:w,text:y(e.registrationEndDate)},{icon:k,text:`${e.city} • ${e.mode}`},{icon:v,text:e.prizeFund.toLocaleString()}];return t.jsx($,{children:a.map(({icon:e,text:a},s)=>t.jsxs(_,{children:[t.jsx("img",{src:e,alt:a}),t.jsx("span",{children:a})]},s))})},$=g.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,_=g.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;function R(){const{id:e}=m(),a=z.find(t=>String(t.id)===e);if(!a)return t.jsx(x,{to:"/hackathons",replace:!0});const s=a.registrationLink,i=s?s.startsWith("http://")||s.startsWith("https://")?s:`https://${s}`:void 0;return t.jsxs(A,{children:[t.jsx(F,{...a}),t.jsx(E,{mode:"bezeled",onClick:()=>{if(!i)return;const e=window.Telegram?.WebApp;e?.openLink?e.openLink(i,{try_instant_view:!0}):window.open(i,"_blank","noopener,noreferrer")},disabled:!i,children:"Подробнее на сайте"}),t.jsx(E,{children:"Пойти на хакатон"})]})}const A=g.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`,E=g(D)`
  width: 100%;
`;export{R as default};
