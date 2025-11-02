// HackathonsPage.tsx
import { FC } from "react";
import styled from "styled-components";
import { Hackathon } from "@/shared/types/hackathon";
import { HackathonCard } from "@/widgets/HackathonCard";
import { hackathons } from "@/shared/mocks/hackathons";
import { paths } from "@/app/routing/paths";
import { Link } from "react-router-dom";

export const HackathonsPage: FC = () => {
  return (
    <Grid>
      {hackathons.map((hackathon: Hackathon) => (
        <CardLink
          key={hackathon.id}
          to={paths.hackathon(hackathon.id)}
          onMouseEnter={() => import("@/pages/HackathonPage")}
        >
          <HackathonCard key={hackathon.id} {...hackathon} />
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
