import styled from "styled-components";
import {
  Avatar,
  List,
  Multiselect,
  MultiselectProps,
  Section,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { STitle } from "@/shared/ui/STitle";
import { useState, useEffect, ChangeEvent } from "react";

import { useAuthUser, useEditUserMainInfo } from "@/entities/user/api/hooks";
import { Skill } from "@/entities/skill/model/types";
import { useSkills } from "@/entities/skill/api/hooks";

import { AchievementItem } from "@/widgets/achievements/AchievementItem";
type MultiSelectOption = MultiselectProps["options"][number];
const MAX_BIO = 256;
const MAX_SKILLS = 10;

export const ProfilePage = () => {
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: skills = [], isLoading: isSkillsLoading } = useSkills();
  const editMainInfoMutation = useEditUserMainInfo();

  const [selectedSkillSlugs, setSelectedSkillSlugs] = useState<string[]>([]);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [bio, setBio] = useState<string>("");
  const [bioError, setBioError] = useState<string | null>(null);

  const [lastSavedBio, setLastSavedBio] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;

    const initialBio = user.bio ?? "";
    setBio(initialBio);
    setLastSavedBio(initialBio);
    setSelectedSkillSlugs(user.skills.map((s) => s.slug));

    setBioError(null);
    setSkillsError(null);
    setIsInitialized(true);
  }, [user]);

  function skillsToOptions(skills: Skill[]): MultiSelectOption[] {
    return skills.map((s) => ({
      value: s.slug,
      label: s.name,
    }));
  }

  const options = skillsToOptions(skills);

  const selectedOptions = options.filter((opt) =>
    selectedSkillSlugs.includes(String(opt.value))
  );

  const handleSkillsChange = (selected: MultiSelectOption[]) => {
    if (selected.length > MAX_SKILLS) {
      setSkillsError(`Нельзя выбрать больше ${MAX_SKILLS} навыков`);
      return;
    }

    const slugs = selected.map((o) => String(o.value));
    setSelectedSkillSlugs(slugs);
    setSkillsError(null);

    if (!isInitialized || !user) return;

    const currentFromUser = user.skills.map((s) => s.slug);
    const same =
      currentFromUser.length === slugs.length &&
      currentFromUser.every((s) => slugs.includes(s));

    if (same) return;

    editMainInfoMutation.mutate({
      skillSlugs: slugs,
    });
  };

  const handleBioChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = event.target.value;
    setBio(newBio);

    if (newBio.length > MAX_BIO) {
      setBioError(`Описание должно быть не больше ${MAX_BIO} символов`);
    } else {
      setBioError(null);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;
    if (bioError) return;
    if (bio === lastSavedBio) return;

    const timeoutId = setTimeout(() => {
      editMainInfoMutation.mutate(
        { bio: bio || undefined },
        {
          onSuccess: () => {
            setLastSavedBio(bio);
          },
        }
      );
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [bio, bioError, isInitialized, user, lastSavedBio, editMainInfoMutation]);

  const isLoading = isUserLoading || isSkillsLoading;

  return (
    <SProfile>
      <SProfileHeader>
        <Avatar size={96} src={user?.avatarUrl || undefined} />
        <SFullName>
          <STitle $fs={24} $fw={600}>
            {user?.firstName}
          </STitle>
          <STitle $fs={24} $fw={600}>
            {user?.secondName}
          </STitle>
        </SFullName>
      </SProfileHeader>

      <SExtraInfo>
        <SSection header="Навыки" footer={skillsError}>
            <SMultiselect
              status={skillsError ? "error" : "default"}
              options={options}
              value={selectedOptions}
              onChange={handleSkillsChange}
              selectedBehavior="hide"
              closeDropdownAfterSelect={false}
              creatable={false}
              placeholder={
                isLoading ? "Загружаем навыки..." : "Выберите до 10 навыков"
              }
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
          <List>
            {user?.achievements?.map((a) => (
              <AchievementItem key={a.id} achievement={a} />
            ))}
          </List>
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
  gap: 0rem;
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

const SMultiselect = styled(Multiselect)`
  background: var(--tg-theme-section-bg-color, #fff);
`;
