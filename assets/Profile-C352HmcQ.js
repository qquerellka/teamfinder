import{n as e,d as i,k as s,v as t,j as n}from"./index-CAhzXg4V.js";import{A as r}from"./Avatar-BARwD-Ex.js";const a=i(s)`
  && {
    ${({$fs:i})=>(i=>{if(void 0!==i)return"number"==typeof i?e`
      font-size: ${i}px;
      line-height: ${i+4}px;
    `:e`
    font-size: ${i};
    line-height: calc(${i} + 4px);
  `})(i)}
    ${({$fw:i})=>void 0!==i&&e`
        font-weight: ${i};
      `}
  }
`,l=()=>{const e=t();return n.jsxs(o,{children:[n.jsxs(c,{children:[n.jsx(r,{size:96,src:e.tgWebAppData?.user?.photo_url}),n.jsxs(d,{children:[n.jsx(a,{$fs:24,$fw:600,children:e.tgWebAppData?.user?.first_name}),n.jsx(a,{$fs:24,$fw:600,children:e.tgWebAppData?.user?.last_name})]})]}),n.jsx(f,{})]})},o=i.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.75rem 0;
`,c=i.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,f=i.section`
  display: flex;
  flex-direction: column;
`,d=i.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;export{l as ProfilePage,l as default};
