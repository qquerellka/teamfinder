import{a as e,j as t,T as a,b as i,S as s,r,u as n,c as d,e as o,h as c,f as l,i as f,k as m,d as g,l as h,N as p}from"./index-GHCI7Zu_.js";import{f as u,h as x,b,c as j,d as v,e as w,C as k,g as y}from"./date-BhM7oOma.js";import{h as z}from"./hackathonImage6-shJ4JQ9w.js";const N=r=>{var{size:n}=r,d=e(r,["size"]);return"l"===n?t.jsx(a,i({weight:"2"},d)):t.jsx(s,i({level:"2",weight:"2"},d))},C={filled:"tgui-8a1ca9efa24f4809",bezeled:"tgui-91bda9a36246a33c",plain:"tgui-48956537c34690db",gray:"tgui-93106efd6b6d66ee",outline:"tgui-e884e36ff1faa596",white:"tgui-ba6d30cc81e39ae5"},I={s:"tgui-13f23a224303ddaa",m:"tgui-1a16a49d89076ff4",l:"tgui-9cef742a22f195c9"},L=r.forwardRef((a,s)=>{var{type:r,size:m="m",before:g,after:h,stretched:p,children:u,className:x,mode:b="filled",loading:j,Component:v="button"}=a,w=e(a,["type","size","before","after","stretched","children","className","mode","loading","Component"]);const k=n();return t.jsxs(d,o(i({ref:s,type:r||"button",Component:v,className:f("tgui-117e77cd385a9c8d",b&&C[b],m&&I[m],"ios"===k&&"tgui-55e8aa7f5cea2280",p&&"tgui-726846958fe7f4a0",j&&"tgui-490cb0f5ec4998f3",x)},w),{children:[j&&t.jsx(l,{className:"tgui-014f2b7d196b090d",size:"s"}),c(g)&&t.jsx("div",{className:"tgui-06cc94d03a7c4dd7",children:g}),t.jsx(N,{className:"tgui-5f6014c0f063b6de",size:m,children:u}),c(h)&&t.jsx("div",{className:"tgui-8310172a5320ab71",children:h})]}))}),_=["/teamfinder/assets/download-BZzLZBnf.jpeg","/teamfinder/assets/hackathonImage8-aTSIG1ph.webp",z,"/teamfinder/assets/hackathonImage4-_p73mbel.webp","/teamfinder/assets/hackathonImage9-DMpyzT_x.png"],D=({id:e,name:a,startDate:i,endDate:s,registrationEndDate:r,city:n,mode:d,prizeFund:o})=>{const c=[{icon:x,text:u(i,s)},{icon:j,text:b(r)},{icon:v,text:`${n} • ${d}`},{icon:w,text:o.toLocaleString()}];return t.jsxs(S,{children:[t.jsx(T,{children:t.jsx("img",{src:_[e%5],alt:a})}),t.jsxs(W,{children:[t.jsx(m,{weight:"2",children:a}),t.jsx(Z,{children:c.map(({icon:e,text:a},i)=>t.jsxs(B,{children:[t.jsx("img",{src:e,alt:a}),t.jsx($,{level:"2",weight:"3",children:a})]},i))})]})]},e)},S=g(k)`
  background: var(--tg-theme-section-bg-color, #fff);
  border-radius: 1rem;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 1.5rem;
`,T=g.div`
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0.25) 100%
    );
    pointer-events: none;
  }
`,W=g.div`
  margin: 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`,$=g(m)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
  line-height: normal;
`,B=g.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`,Z=g.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;function A(){const{id:e}=h(),a=y.find(t=>String(t.id)===e);if(!a)return t.jsx(p,{to:"/hackathons",replace:!0});const i=a.registrationLink,s=i?i.startsWith("http://")||i.startsWith("https://")?i:`https://${i}`:void 0;return t.jsxs(E,{children:[t.jsx(D,{...a}),t.jsx(F,{mode:"bezeled",onClick:()=>{if(!s)return;const e=window.Telegram?.WebApp;e?.openLink?e.openLink(s,{try_instant_view:!0}):window.open(s,"_blank","noopener,noreferrer")},disabled:!s,children:"Подробнее на сайте"}),t.jsx(F,{children:"Пойти на хакатон"})]})}const E=g.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`,F=g(L)`
  width: 100%;
`;export{A as default};
