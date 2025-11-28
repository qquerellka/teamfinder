import{j as i,p as s,d as a,L as o}from"./index-Cv9YKEEG.js";import{u as e,H as t}from"./hackathon-api-D_GG8a7V.js";import"./STitle-D3HT7kV9.js";import"./Subheadline-DzNsafsf.js";const d=()=>{const{data:a,isLoading:o,error:d}=e();return o?i.jsx("div",{children:"Загружаем хакатоны…"}):d?i.jsx("div",{children:"Что-то пошло не так"}):a?.items.length?(console.log(a),i.jsx(n,{children:a.items.map(a=>i.jsx(r,{to:s.hackathon(a.id),children:i.jsx(t,{hackathon:a})},a.id))})):i.jsx("div",{children:"Пока нет активных хакатонов"})},n=a.section`
  display: grid;
  gap: 12px;
`,r=a(o)`
  display: block;
  text-decoration: none;
  color: inherit;
`,c=()=>i.jsx(l,{children:i.jsx(d,{})}),l=a.section`
  display: grid;
  gap: 12px;
`;export{c as HackathonsPage,c as default};
