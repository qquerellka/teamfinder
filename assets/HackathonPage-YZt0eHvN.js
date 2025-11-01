import{a as e,j as a,T as t,b as i,S as s,r as n,u as r,c as d,e as c,h as o,f,i as l,l as h,d as g,k as u,m,N as p}from"./index-DKtqJppV.js";import{h as x,H as b}from"./hackathons-1nXeMUjb.js";import"./hackathonImage6-shJ4JQ9w.js";const j=n=>{var{size:r}=n,d=e(n,["size"]);return"l"===r?a.jsx(t,i({weight:"2"},d)):a.jsx(s,i({level:"2",weight:"2"},d))},w={filled:"tgui-8a1ca9efa24f4809",bezeled:"tgui-91bda9a36246a33c",plain:"tgui-48956537c34690db",gray:"tgui-93106efd6b6d66ee",outline:"tgui-e884e36ff1faa596",white:"tgui-ba6d30cc81e39ae5"},$={s:"tgui-13f23a224303ddaa",m:"tgui-1a16a49d89076ff4",l:"tgui-9cef742a22f195c9"},v=n.forwardRef((t,s)=>{var{type:n,size:h="m",before:g,after:u,stretched:m,children:p,className:x,mode:b="filled",loading:v,Component:z="button"}=t,k=e(t,["type","size","before","after","stretched","children","className","mode","loading","Component"]);const N=r();return a.jsxs(d,c(i({ref:s,type:n||"button",Component:z,className:l("tgui-117e77cd385a9c8d",b&&w[b],h&&$[h],"ios"===N&&"tgui-55e8aa7f5cea2280",m&&"tgui-726846958fe7f4a0",v&&"tgui-490cb0f5ec4998f3",x)},k),{children:[v&&a.jsx(f,{className:"tgui-014f2b7d196b090d",size:"s"}),o(g)&&a.jsx("div",{className:"tgui-06cc94d03a7c4dd7",children:g}),a.jsx(j,{className:"tgui-5f6014c0f063b6de",size:h,children:p}),o(u)&&a.jsx("div",{className:"tgui-8310172a5320ab71",children:u})]}))}),z=g(u)`
  && {
    ${({$fs:e})=>(e=>{if(void 0!==e)return"number"==typeof e?h`
      font-size: ${e}px;
      line-height: ${e+4}px;
    `:h`
    font-size: ${e};
    line-height: calc(${e} + 4px);
  `})(e)}
    ${({$fw:e})=>void 0!==e&&h`
        font-weight: ${e};
      `}
  }
`;function k(){const{id:e}=m(),t=x.find(a=>String(a.id)===e);if(!t)return a.jsx(p,{to:"/hackathons",replace:!0});const i=t.registrationLink,s=i?i.startsWith("http://")||i.startsWith("https://")?i:`https://${i}`:void 0;return a.jsxs(N,{children:[a.jsx(C,{$fw:600,$fs:24,children:t.name}),a.jsx(b,{...t}),a.jsx(y,{mode:"bezeled",onClick:()=>{if(!s)return;const e=window.Telegram?.WebApp;e?.openLink?e.openLink(s,{try_instant_view:!0}):window.open(s,"_blank","noopener,noreferrer")},disabled:!s,children:"Подробнее на сайте"}),a.jsx(y,{children:"Пойти на хакатон"})]})}const N=g.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`,y=g(v)`
  width: 100%;
`,C=g(z)`
  align-self: center; /* центрирует элемент в поперечной оси flex */
`;export{k as default};
