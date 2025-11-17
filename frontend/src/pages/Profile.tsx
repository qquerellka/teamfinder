import styled from "styled-components";
import {
  Avatar,
  Multiselect,
  MultiselectProps,
  Section,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { STitle } from "@/shared/ui/STitle";
import { useLaunchParams } from "@tma.js/sdk-react";
import { useState, ChangeEvent, FC } from "react";

import { Achievement } from "@/shared/types/achievement";
import { formatHackPlace } from "@/shared/helpers/date";

type MultiSelectOptions = MultiselectProps["options"][number];

const MAX_SKILLS = 10;
const MAX_BIO = 256;

const skillsOptions: MultiSelectOptions[] = [
  { value: "js", label: "JS" },
  { value: "react", label: "React" },
  { value: "node", label: "Node.js" },
  { value: "ui", label: "UI/UX Design" },
  { value: "mobile", label: "Mobile Development" },
  { value: "html", label: "HTML&CSS" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "ruby", label: "Ruby" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "graphql", label: "GraphQL" },
  { value: "rust", label: "Rust" },
  { value: "lua", label: "Lua" },
  { value: "vhdl", label: "VHDL" },
  { value: "matlab", label: "MATLAB" },
  { value: "objectivec", label: "Objective-C" },
  { value: "dart", label: "Dart" },
  { value: "flutter", label: "Flutter" },
];

const mockAchievements: Achievement[] = [
  {
    id: "qwvge02837ydb21872`dpjinsd",
    name: "TenderHack 2025",
    place: "1",
    userId: "123",
    role: "Backend",
    hackLink: "https://github.com/qquerellka",
  },
  {
    id: "qwvge02837ydb21872`dpjinh",
    name: "МТС True Tech",
    place: "Участие",
    userId: "123",
    role: "Backend",
    hackLink: "https://github.com/qquerellka",
  },
  {
    id: "qwvge02837ydb21872`dpjins",
    name: "VTB API 2025",
    place: "Финал",
    userId: "123",
    role: "Frontend",
    hackLink: "https://github.com/qquerellka",
  },
  {
    id: "qwvge02837ydb21872`dpjinq",
    name: "Digital Spring 2024",
    place: "4",
    userId: "123",
    role: "Backend",
    hackLink: "https://github.com/qquerellka",
  },
];

export const ProfilePage = () => {
  const launchParams = useLaunchParams();

  const [selectedSkills, setSelectedSkills] = useState<MultiSelectOptions[]>(
    []
  );
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const handleSkillsChange = (selected: MultiSelectOptions[]) => {
    if (selected.length > MAX_SKILLS) {
      setSkillsError(`Нельзя выбрать больше ${MAX_SKILLS} навыков`);
    } else {
      setSelectedSkills(selected);
      setSkillsError(null);
    }
  };

  const [bio, setBio] = useState<string>("");
  const [bioError, setBioError] = useState<string | null>(null);

  const handleBioChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = event.target.value;

    setBio(newBio);

    if (newBio.length > MAX_BIO) {
      setBioError(`Описание должно быть не больше ${MAX_BIO} символов`);
    } else {
      setBioError(null);
    }
  };

  return (
    <SProfile>
      <SProfileHeader>
        <Avatar size={96} src={launchParams.tgWebAppData?.user?.photo_url} />
        <SFullName>
          <STitle $fs={24} $fw={600}>
            {launchParams.tgWebAppData?.user?.first_name}
          </STitle>
          <STitle $fs={24} $fw={600}>
            {launchParams.tgWebAppData?.user?.last_name}
          </STitle>
        </SFullName>
      </SProfileHeader>

      <SExtraInfo>
        <SSection header="Навыки" footer={skillsError}>
          <SMultiselect
            // style={{
            //   backgroundColor: `var(--tg-theme-section-bg-color, #fff)`,
            // }}
            status={skillsError ? "error" : "default"}
            options={skillsOptions}
            value={selectedSkills}
            onChange={handleSkillsChange}
            selectedBehavior="hide"
            closeDropdownAfterSelect={false}
            creatable={true}
            placeholder="Выберите до 10 навыков"
          />
        </SSection>

        <SSection header="Обо мне" footer={bioError}>
          <Textarea
            status={bioError ? "error" : "default"}
            value={bio}
            onChange={handleBioChange}
            placeholder="Расскажите немного о себе..."
          />
        </SSection>
        <SSection header="Достижения">
          {mockAchievements.map((mockAchievement) => (
            <AchievementCard
              key={mockAchievement.id}
              achievement={mockAchievement}
            />
          ))}
        </SSection>
      </SExtraInfo>
    </SProfile>
  );
};

export default ProfilePage;

const SProfile = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0;
  gap: 1.5rem;
`;

const SProfileHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const SExtraInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
`;

const SFullName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const SSection = styled(Section)`
  background: var(--tg-theme-section-bg-color, #fff);
  padding: 1rem;
  border-radius: 1rem;
  & > div {
    display: flex;
    flex-direction: column;

    & > header {
      padding: 0;
      box-shadow: none;
    }
    & > div {
      padding: 0;
      & > div {
        background: var(--tg-theme-section-bg-color, #fff);
        padding: 1rem 0 1rem 0;
      }
    }
  }
  & > footer {
    padding-bottom: 0;
    & > h6 {
      color: var(--tg-theme-destructive-text-color, #fff);
    }
  }
`;

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: FC<AchievementCardProps> = ({ achievement }) => {
  return (
    <SAchievementCard>
      <STitle>{achievement.name}</STitle>
      <STitle>{formatHackPlace(achievement.place)}</STitle>
    </SAchievementCard>
  );
};

const SAchievementCard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 0;
  font-size: var();
`;

const SMultiselect = styled(Multiselect)`
  background: var(#fff);
`;
