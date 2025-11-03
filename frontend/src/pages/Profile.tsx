import styled from "styled-components";
import { Avatar } from "@telegram-apps/telegram-ui";
import { STitle } from "@/shared/ui/STitle";
import { useLaunchParams } from "@tma.js/sdk-react";
// import { useState } from "react";

// Define the type for MultiselectOption with string value
// interface MultiselectOption {
//   value: string;  // Change value type to string
//   label: string;
// }

export const ProfilePage = () => {
  const u = useLaunchParams();
  // const [selectedOptions, setSelectedOptions] = useState<MultiselectOption[]>([]);

  // Define options with string values
  // const options: MultiselectOption[] = [
  //   { value: "1", label: "React" },
  //   { value: "2", label: "Svelte" },
  //   { value: "3", label: "Angular" },
  //   { value: "4", label: "Vue" },
  //   { value: "5", label: "React Native" },
  //   { value: "6", label: "Solid" },
  //   { value: "7", label: "Next" },
  //   { value: "8", label: "Nuxt" },
  // ];

  // Update handleChange to accept selected options of type MultiselectOption[]
  // const handleChange = (selectedValues: MultiselectOption[]) => {
  //   setSelectedOptions(selectedValues);
  // };

  return (
    <SProfile>
      <SProfileHeader>
        <Avatar size={96} src={u.tgWebAppData?.user?.photo_url}></Avatar>
        <SFullName>
          <STitle $fs={24} $fw={600}>
            {u.tgWebAppData?.user?.first_name}
          </STitle>
          <STitle $fs={24} $fw={600}>
            {u.tgWebAppData?.user?.last_name}
          </STitle>
        </SFullName>
      </SProfileHeader>
      <SExtraInfo>
      </SExtraInfo>
    </SProfile>
  );
};

export default ProfilePage;

const SProfile = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.75rem 0;
`;

const SProfileHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const SExtraInfo = styled.section`
  display: flex;
  flex-direction: column;
`;

const SFullName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;
