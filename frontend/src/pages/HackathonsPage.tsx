// HackathonsPage.tsx
import { FC } from "react";
import styled from "styled-components";
import { Hackathon } from "@/shared/types/hackathon";
import { HackathonCard } from "@/widgets/HackathonCard";
import { hackathons } from "@/shared/mocks/hackathons";

export const HackathonsPage: FC<Hackathon[]> = () => {
  return (
    <Grid>
      {hackathons.map((hackathon: Hackathon) => {
        return <HackathonCard key={hackathon.id} {...hackathon} />;
      })}
    </Grid>
  );
};

// --- styled-components ---
const Grid = styled.section`
  display: grid;
  gap: 12px;
`;
