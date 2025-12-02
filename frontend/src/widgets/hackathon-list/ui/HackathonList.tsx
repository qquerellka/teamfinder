import { FC } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { paths } from "@/app/routing/paths";
import { HackathonCard } from "@/entities/hackathon/ui/HackathonCard";
import { useHackathonsQuery } from "@/entities/hackathon/api/hooks";

export const HackathonList: FC = () => {
  const { data, isLoading, error } = useHackathonsQuery();

  if (isLoading) return <div>Загружаем хакатоны…</div>;
  if (error) return <div>Что-то пошло не так</div>;
  if (!data?.items.length) return <div>Пока нет активных хакатонов</div>;
  console.log(data)
  return (
    <Grid>
      {data.items.map((h) => (
        <CardLink key={h.id} to={paths.hackathon(h.id)}>
          <HackathonCard hackathon={h} />
        </CardLink>
      ))}
    </Grid>
  );
};


const Grid = styled.section`
  display: grid;
  gap: 12px;
`;

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;
