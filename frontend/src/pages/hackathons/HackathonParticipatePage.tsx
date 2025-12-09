import React, { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { paths } from "@/app/routing/paths";
import { Page } from "@/shared/ui/Page";
import { useHackathonQuery } from "@/entities/hackathon/api/hooks";
import { SegmentedControl } from "@telegram-apps/telegram-ui";
import { SegmentedControlItem } from "@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem";
import { HackathonApplication } from "@/features/application/create/ui/HackathonApplication";
import { LoaderPage } from "@/shared/ui/LoaderPage";

const HackathonVacancies = ({ hackathonId }: { hackathonId: number }) => {
  return <div>Тут список вакансий для хакатона {hackathonId}</div>;
};

const HackathonParticipatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hackathonId = Number(id);

  const {
    data: hackathon,
    isLoading,
    isError,
  } = useHackathonQuery(hackathonId);

  const [tab, setTab] = useState<"applications" | "vacancies">("applications");

  if (isLoading) {
    return <LoaderPage />;
  }

  if (isError || !hackathon) {
    return <Navigate to={paths.error404} replace />;
  }

  return (
    <Page>
      <SegmentedControl style={{margin: '1rem 0'}}>
        <SegmentedControlItem
          selected={tab === "applications"}
          onClick={() => setTab("applications")}
        >
          Анкеты
        </SegmentedControlItem>
        <SegmentedControlItem
          selected={tab === "vacancies"}
          onClick={() => setTab("vacancies")}
        >
          Вакансии
        </SegmentedControlItem>
      </SegmentedControl>

      {tab === "applications" && (
        <HackathonApplication hackathon={hackathon} />
      )}

      {tab === "vacancies" && <HackathonVacancies hackathonId={hackathonId} />}
    </Page>
  );
};

export default HackathonParticipatePage;
