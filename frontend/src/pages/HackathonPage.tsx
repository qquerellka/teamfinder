import { hackathons } from "@/shared/mocks/hackathons";
import { Hackathon } from "@/shared/types/hackathon";
import { HackathonCard } from "@/widgets/HackathonCard";
import { FC } from "react";
import { Navigate, useParams } from "react-router-dom";

export const HackathonPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const hackathon: Hackathon | undefined = hackathons.find(h => String(h.id) === id);

    if (!hackathon) return <Navigate to="*" replace />;

  return (
    <HackathonCard {...hackathon}/>
  );
};

export default HackathonPage;

