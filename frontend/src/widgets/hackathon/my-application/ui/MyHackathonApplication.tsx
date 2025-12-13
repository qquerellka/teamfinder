import type { FC } from "react";
import { useState } from "react";
import styled from "styled-components";

import type { Hackathon } from "@/entities/hackathon";
import { useAuthUserApplicationsOnHackathon } from "@/entities/application";

import { CreateApplicationForm } from "@/features/application/create";
import { EditApplicationForm } from "@/features/application/edit";

import { MyApplicationCard } from "./MyApplicationCard";
import { ApplicationInvites } from "@/widgets/invites/application-invites"; // важно: widget, не feature
import { useNavigate } from "react-router-dom";

export const MyHackathonApplication: FC<{ hackathon: Hackathon }> = ({
  hackathon,
}) => {
  const { data: application } = useAuthUserApplicationsOnHackathon(
    hackathon.id
  );
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (!application) {
    return (
      <CreateApplicationForm
        hackathonId={hackathon.id}
        hackathonName={hackathon.name}
      />
    );
  }

  if (isEditing) {
    return (
      <EditApplicationForm
        hackathonName={hackathon.name}
        application={application}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Wrapper>
      <MyApplicationCard
        hackathon={hackathon}
        application={application}
        onEditClick={() => setIsEditing(true)}
        onDeleted={() => navigate(-1)}
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
