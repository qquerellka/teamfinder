import{a as e,j as t,T as i,b as a,S as s,r,u as n,c as o,e as d,h as c,f as l,i as g,k as h,d as f,l as m,N as p}from"./index-7qL5cUQP.js";import{f as u,b as x,g as b,c as j,d as w,h as v,C as k,e as y}from"./hackathonImage6-CDRMpL0m.js";const z=r=>{var{size:n}=r,o=e(r,["size"]);return"l"===n?t.jsx(i,a({weight:"2"},o)):t.jsx(s,a({level:"2",weight:"2"},o))},D={filled:"tgui-8a1ca9efa24f4809",bezeled:"tgui-91bda9a36246a33c",plain:"tgui-48956537c34690db",gray:"tgui-93106efd6b6d66ee",outline:"tgui-e884e36ff1faa596",white:"tgui-ba6d30cc81e39ae5"},C={s:"tgui-13f23a224303ddaa",m:"tgui-1a16a49d89076ff4",l:"tgui-9cef742a22f195c9"},_=r.forwardRef((i,s)=>{var{type:r,size:h="m",before:f,after:m,stretched:p,children:u,className:x,mode:b="filled",loading:j,Component:w="button"}=i,v=e(i,["type","size","before","after","stretched","children","className","mode","loading","Component"]);const k=n();return t.jsxs(o,d(a({ref:s,type:r||"button",Component:w,className:g("tgui-117e77cd385a9c8d",b&&D[b],h&&C[h],"ios"===k&&"tgui-55e8aa7f5cea2280",p&&"tgui-726846958fe7f4a0",j&&"tgui-490cb0f5ec4998f3",x)},v),{children:[j&&t.jsx(l,{className:"tgui-014f2b7d196b090d",size:"s"}),c(f)&&t.jsx("div",{className:"tgui-06cc94d03a7c4dd7",children:f}),t.jsx(z,{className:"tgui-5f6014c0f063b6de",size:h,children:u}),c(m)&&t.jsx("div",{className:"tgui-8310172a5320ab71",children:m})]}))}),N=["/teamfinder/assets/download-BZzLZBnf.jpeg","/teamfinder/assets/hackathonImage8-aTSIG1ph.webp",v,"/teamfinder/assets/hackathonImage4-_p73mbel.webp","/teamfinder/assets/hackathonImage9-DMpyzT_x.png"],L=({id:e,name:i,startDate:a,endDate:s,registrationEndDate:r,city:n,mode:o,prizeFund:d})=>{const c=[{icon:x,text:u(a,s)},{icon:"data:image/svg+xml,%3csvg%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_2039_7200)'%3e%3cpath%20d='M8.00065%204V8L5.33398%206.66667'%20stroke='%23D9D9D9'%20stroke-width='1.33'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M8.00065%2014.6673C11.6825%2014.6673%2014.6673%2011.6825%2014.6673%208.00065C14.6673%204.31875%2011.6825%201.33398%208.00065%201.33398C4.31875%201.33398%201.33398%204.31875%201.33398%208.00065C1.33398%2011.6825%204.31875%2014.6673%208.00065%2014.6673Z'%20stroke='%23D9D9D9'%20stroke-width='1.33'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_2039_7200'%3e%3crect%20width='16'%20height='16'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",text:b(r)},{icon:j,text:`${n} • ${o}`},{icon:w,text:d.toLocaleString()}];return t.jsxs(I,{children:[t.jsx(S,{children:t.jsx("img",{src:N[e%5],alt:i})}),t.jsxs(T,{children:[t.jsx(h,{weight:"2",children:i}),t.jsx(W,{children:c.map(({icon:e,text:i},a)=>t.jsxs(M,{children:[t.jsx("img",{src:e,alt:i}),t.jsx(B,{level:"2",weight:"3",children:i})]},a))})]})]},e)},I=f(k)`
  background: var(--tg-theme-section-bg-color, #fff);
  border-radius: 1rem;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 1.5rem;
`,S=f.div`
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
`,T=f.div`
  margin: 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`,B=f(h)`
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 1rem;
  line-height: normal;
`,M=f.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`,W=f.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;function Z(){const{id:e}=m(),i=y.find(t=>String(t.id)===e);if(!i)return t.jsx(p,{to:"/hackathons",replace:!0});const a=i.registrationLink,s=a?a.startsWith("http://")||a.startsWith("https://")?a:`https://${a}`:void 0;return t.jsxs($,{children:[t.jsx(L,{...i}),t.jsx(P,{mode:"bezeled",onClick:()=>{if(!s)return;const e=window.Telegram?.WebApp;e?.openLink?e.openLink(s,{try_instant_view:!0}):window.open(s,"_blank","noopener,noreferrer")},disabled:!s,children:"Подробнее на сайте"}),t.jsx(P,{children:"Пойти на хакатон"})]})}const $=f.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`,P=f(_)`
  width: 100%;
`;export{Z as default};
