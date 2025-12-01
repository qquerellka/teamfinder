import{j as i,p as s,d as a,L as o}from"./index-kpqgMVnE.js";import{u as e,H as n}from"./hackathon-api-CE-TG_sr.js";import"./client-Snpknwer.js";import"./Subheadline-DIqHX51-.js";const t=()=>{const{data:a,isLoading:o,error:t}=e();return o?i.jsx("div",{children:"Загружаем хакатоны…"}):t?i.jsx("div",{children:"Что-то пошло не так"}):a?.items.length?(console.log(a),i.jsx(d,{children:a.items.map(a=>i.jsx(r,{to:s.hackathon(a.id),children:i.jsx(n,{hackathon:a})},a.id))})):i.jsx("div",{children:"Пока нет активных хакатонов"})},d=a.section`
  display: grid;
  gap: 12px;
`,r=a(o)`
  display: block;
  text-decoration: none;
  color: inherit;
`,c=()=>i.jsx(l,{children:i.jsx(t,{})}),l=a.section`
  display: grid;
  gap: 12px;
`;export{c as HackathonsPage,c as default};
