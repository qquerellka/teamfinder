import { useTeam } from "@/entities/team/api/hooks";
import { TeamApplications } from "@/features/team/applications/TeamApplications";
import { Page, STitle } from "@/shared/ui";
import { SegmentedControl } from "@telegram-apps/telegram-ui";
import { SegmentedControlItem } from "@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem";
import { useState } from "react";
import { useParams } from "react-router-dom";

export const FindTeamMemberPage = () => {
  const { id } = useParams<{ id: string }>();
//   const teamId = Number(id);
const { data: team } = useTeam(Number(id));
  const [tab, setTab] = useState<"vacancy" | "applications">("vacancy");

  return (
    <Page>
      <SegmentedControl style={{ margin: "1rem 0" }}>
        <SegmentedControlItem
          selected={tab === "vacancy"}
          onClick={() => setTab("vacancy")}
        >
          Вакансия
        </SegmentedControlItem>
        <SegmentedControlItem
          selected={tab === "applications"}
          onClick={() => setTab("applications")}
        >
          Анкеты
        </SegmentedControlItem>
      </SegmentedControl>

      {tab === "applications" && <TeamApplications team={team} />}

      {tab === "vacancy" && <STitle>{"Вакансия"}</STitle>}
    </Page>
  );
};
export default FindTeamMemberPage;
