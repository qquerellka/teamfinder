import { Hackathon } from "@/entities/hackathon/model/types";
import { LoaderPage } from "@/shared/ui/LoaderPage";
import { useAuthUserApplicationsOnHackathon } from "@/entities/application/api/hooks";
import { HackathonApplicationCreateForm } from "./HackathonApplicationCreateForm";
import { HackathonApplicationCard } from "./HackathonApplicationCard";
import { FC } from "react";

interface HackathonApplicationProps {
  hackathon: Hackathon;
};

export const HackathonApplication:FC<HackathonApplicationProps> = ({ hackathon }) => {
  const {
    data: application,
    isLoading,
    isError,
  } = useAuthUserApplicationsOnHackathon(hackathon.id);

  if (isLoading) {
    return <LoaderPage />;
  }

  if (isError) {
    return <div>Не удалось загрузить анкету. Попробуйте позже.</div>;
  }

  if (!application) {
    return <HackathonApplicationCreateForm hackathon={hackathon} />;
  }

  return (
    <HackathonApplicationCard hackathon={hackathon} application={application} />
  );
};
