import{_ as e,j as a,T as t,a as i,r as s,u as r,b as n,c as d,h as c,S as o,e as l,f,N as h,d as u}from"./index-C0WIc_2_.js";import{a as g,H as p}from"./hackathon-api-CEeXeKUs.js";import{S as m}from"./Subheadline-DOFz1jfj.js";import"./client-C9Tcqq51.js";const x=s=>{var{size:r}=s,n=e(s,["size"]);return"l"===r?a.jsx(t,i({weight:"2"},n)):a.jsx(m,i({level:"2",weight:"2"},n))},j={filled:"tgui-8a1ca9efa24f4809",bezeled:"tgui-91bda9a36246a33c",plain:"tgui-48956537c34690db",gray:"tgui-93106efd6b6d66ee",outline:"tgui-e884e36ff1faa596",white:"tgui-ba6d30cc81e39ae5"},b={s:"tgui-13f23a224303ddaa",m:"tgui-1a16a49d89076ff4",l:"tgui-9cef742a22f195c9"},k=s.forwardRef((t,s)=>{var{type:f,size:h="m",before:u,after:g,stretched:p,children:m,className:k,mode:v="filled",loading:w,Component:z="button"}=t,N=e(t,["type","size","before","after","stretched","children","className","mode","loading","Component"]);const y=r();return a.jsxs(n,d(i({ref:s,type:f||"button",Component:z,className:l("tgui-117e77cd385a9c8d",v&&j[v],h&&b[h],"ios"===y&&"tgui-55e8aa7f5cea2280",p&&"tgui-726846958fe7f4a0",w&&"tgui-490cb0f5ec4998f3",k)},N),{children:[w&&a.jsx(o,{className:"tgui-014f2b7d196b090d",size:"s"}),c(u)&&a.jsx("div",{className:"tgui-06cc94d03a7c4dd7",children:u}),a.jsx(x,{className:"tgui-5f6014c0f063b6de",size:h,children:m}),c(g)&&a.jsx("div",{className:"tgui-8310172a5320ab71",children:g})]}))}),v=()=>{const{id:e}=f();if(!e)return a.jsx(h,{to:"/hackathons",replace:!0});const{data:t,isLoading:i,isError:s}=g(e);if(i)return a.jsx(z,{children:a.jsx(y,{children:"Загружаем хакатон…"})});if(s)return a.jsxs(z,{children:[a.jsx(y,{children:"Не удалось загрузить данные хакатона. Попробуйте позже."}),a.jsx(w,{to:"/hackathons"})]});if(!t)return a.jsx(h,{to:"/hackathons",replace:!0});const r=(e=>{if(!e)return;const a=e.trim();return a?a.startsWith("http://")||a.startsWith("https://")?a:`https://${a}`:void 0})(t.registrationLink);return a.jsxs(z,{children:[a.jsx(p,{hackathon:t,variant:"full"}),a.jsx(N,{mode:"bezeled",onClick:()=>{if(!r)return;const e=window.Telegram?.WebApp;e?.openLink?e.openLink(r,{try_instant_view:!0}):window.open(r,"_blank","noopener,noreferrer")},disabled:!r,children:"Подробнее на сайте"}),a.jsx(N,{children:"Пойти на хакатон"})]})},w=({to:e})=>a.jsx("a",{href:e,children:"← К списку хакатонов"}),z=u.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`,N=u(k)`
  width: 100%;
`,y=u.div`
  padding: 1rem;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
`;export{v as default};
