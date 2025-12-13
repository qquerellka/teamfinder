import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Page } from "@/shared/ui/Page";
import { useHackathonQuery } from "@/entities/hackathon";
import { SegmentedControl } from "@telegram-apps/telegram-ui";
import { SegmentedControlItem } from "@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem";
import { HackathonApplication } from "@/features/application/create/ui/HackathonApplication";

const HackathonVacancies = ({ hackathonId }: { hackathonId: number }) => {
  return <div>Тут список вакансий для хакатона {hackathonId}</div>;
};

const HackathonParticipatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hackathonId = Number(id);

  const { data: hackathon } = useHackathonQuery(hackathonId);

  const [tab, setTab] = useState<"applications" | "vacancies">("applications");

  return (
    <Page>
      <SegmentedControl style={{ margin: "1rem 0" }}>
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

      {tab === "applications" && <HackathonApplication hackathon={hackathon} />}

      {tab === "vacancies" && <HackathonVacancies hackathonId={hackathonId} />}
    </Page>
  );
};

export default HackathonParticipatePage;
