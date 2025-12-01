import{j as i,p as s,d as a,L as o}from"./index-CpCi2wIc.js";import{u as e,H as t}from"./hackathon-api-aQmi6C5V.js";import"./STitle-gPw8mfuo.js";import"./Subheadline-BTLWCv4x.js";const d=()=>{const{data:a,isLoading:o,error:d}=e();return o?i.jsx("div",{children:"Загружаем хакатоны…"}):d?i.jsx("div",{children:"Что-то пошло не так"}):a?.items.length?(console.log(a),i.jsx(n,{children:a.items.map(a=>i.jsx(r,{to:s.hackathon(a.id),children:i.jsx(t,{hackathon:a})},a.id))})):i.jsx("div",{children:"Пока нет активных хакатонов"})},n=a.section`
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
