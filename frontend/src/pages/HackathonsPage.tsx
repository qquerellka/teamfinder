// HackathonsPage.tsx
import { FC } from "react";
import styled from "styled-components";
import { Hackathon } from "@/shared/types/hackathon";
import { hackathons } from "@/shared/mocks/hackathons";
import { paths } from "@/app/routing/paths";
import { Link } from "react-router-dom";
import { HackathonCard } from "@/widgets/HackathonCard";

export const HackathonsPage: FC = () => {
  return (
    <Grid>
      {hackathons.map((h: Hackathon) => (
        <CardLink
          key={h.id}
          to={paths.hackathon(h.id)}
          onMouseEnter={() => import("@/pages/HackathonPage")}
        >
          <HackathonCard key={h.id} hackathon={h} type="part" />
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

export default HackathonsPage;
