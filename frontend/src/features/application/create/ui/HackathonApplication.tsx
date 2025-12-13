import { FC, useState } from "react";
import { Hackathon } from "@/entities/hackathon";
import { useAuthUserApplicationsOnHackathon } from "@/entities/application";
import { HackathonApplicationCreateForm } from "./HackathonApplicationCreateForm";
import { HackathonApplicationCard } from "./HackathonApplicationCard";
import { HackathonApplicationEditForm } from "./HackathonApplicationEditForm";
import { ApplicationInvites } from "@/features/invite/manage-list/ui/ApplicationInvites";
import styled from "styled-components";
interface HackathonApplicationProps {
  hackathon: Hackathon;
}

export const HackathonApplication: FC<HackathonApplicationProps> = ({
  hackathon,
}) => {
  const { data: application } = useAuthUserApplicationsOnHackathon(
    hackathon.id
  );

  const [isEditing, setIsEditing] = useState(false);

  if (!application) {
    return <HackathonApplicationCreateForm hackathon={hackathon} />;
  }

  if (isEditing) {
    return (
      <HackathonApplicationEditForm
        hackathon={hackathon}
        application={application}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Wrapper>
      <HackathonApplicationCard
        hackathon={hackathon}
        application={application}
        onEditClick={() => setIsEditing(true)}
      />
      <ApplicationInvites appId={application.id} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
