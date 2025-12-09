import { useApplicationInvites } from "@/entities/invite/api/hooks";
import { SText } from "@/shared/ui";
import { FC } from "react";

interface ApplicationInvites {
  appId: number;
}

export const ApplicationInvites: FC<ApplicationInvites> = ({ appId }) => {
  const { data } = useApplicationInvites(appId);
  return (
    <>
      <SText>Приглашения в команду</SText>
      {data?.map((i) => (
        <SText>{i.applicationId}</SText>
      ))}
    </>
  );
};
