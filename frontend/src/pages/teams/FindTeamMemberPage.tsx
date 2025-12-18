import { useTeam } from "@/entities/team";
import { TeamApplications } from "@/features/team/applications/TeamApplications";
import { Page } from "@/shared/ui";
import { TeamVacancy } from "@/widgets/team/team-vacancy/ui/TeamVacancy";
import { SegmentedControl } from "@telegram-apps/telegram-ui";
import { SegmentedControlItem } from "@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem";
import { useState } from "react";
import { useParams } from "react-router-dom";

export const FindTeamMemberPage = () => {
  const { id } = useParams<{ id: string }>();
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

      {tab === "vacancy" && <TeamVacancy team={team} />}
    </Page>
  );
};
export default FindTeamMemberPage;
