import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Page } from "@/shared/ui/Page";
import { useHackathonQuery } from "@/entities/hackathon";
import { SegmentedControl } from "@telegram-apps/telegram-ui";
import { SegmentedControlItem } from "@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem";
import { MyHackathonApplication } from "@/widgets/hackathon/my-application/ui/MyHackathonApplication";
import styled from "styled-components";
import { HackathonVacancies } from "@/features/hackathon/vacancies/HackathonVacancies";

// const HackathonVacancies = ({ hackathonId }: { hackathonId: number }) => {
//   return <div>Тут список вакансий для хакатона {hackathonId}</div>;
// };

const HackathonParticipatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hackathonId = Number(id);

  const { data: hackathon } = useHackathonQuery(hackathonId);

  const [tab, setTab] = useState<"applications" | "vacancies">("applications");

  return (
    <Page>
      <Wrapper>
        <SegmentedControl style={{ margin: "1rem 0" }}>
          <SegmentedControlItem
            selected={tab === "applications"}
            onClick={() => setTab("applications")}
          >
            Анкета
          </SegmentedControlItem>
          <SegmentedControlItem
            selected={tab === "vacancies"}
            onClick={() => setTab("vacancies")}
          >
            Вакансии
          </SegmentedControlItem>
        </SegmentedControl>

        {tab === "applications" && (
          <MyHackathonApplication hackathon={hackathon} />
        )}

        {tab === "vacancies" && (
          <HackathonVacancies hackathon={hackathon} />
        )}
      </Wrapper>
    </Page>
  );
};

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
  height: 100%;
`;
export default HackathonParticipatePage;
