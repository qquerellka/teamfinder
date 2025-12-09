import { Input, Select, Textarea } from "@telegram-apps/telegram-ui";

export const HackathonTeamPage = () => {
  return (
    <>
      <Input placeholder="MISIS x MISIS" />
      <Textarea placeholder="Хотим побеждать!" />
      <Select children={undefined} />
    </>
  );
};

export default HackathonTeamPage;
