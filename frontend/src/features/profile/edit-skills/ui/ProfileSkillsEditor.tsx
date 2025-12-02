// features/profile/edit-skills/ui/ProfileSkillsEditor.tsx
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Multiselect, MultiselectProps, Section } from "@telegram-apps/telegram-ui";

import { useAuthUser, useEditUserMainInfo } from "@/entities/user/api/hooks";
import { useSkills } from "@/entities/skill/api/hooks";
import type { Skill } from "@/entities/skill/model/types";

const MAX_SKILLS = 10;
type MultiSelectOption = MultiselectProps["options"][number];

export const ProfileSkillsEditor = () => {
  const { data: user } = useAuthUser();
  const { data: skills = [], isLoading } = useSkills();
  const editMainInfoMutation = useEditUserMainInfo();

  const [selectedSkillSlugs, setSelectedSkillSlugs] = useState<string[]>([]);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;
    setSelectedSkillSlugs(user.skills.map((s) => s.slug));
    setSkillsError(null);
    setIsInitialized(true);
  }, [user]);

  function skillsToOptions(skills: Skill[]) {
    return skills.map((s) => ({
      value: s.slug,
      label: s.name,
    }));
  }

  const options = skillsToOptions(skills);
  const selectedOptions = options.filter((opt) =>
    selectedSkillSlugs.includes(String(opt.value)),
  );

  const handleChange = (selected: MultiSelectOption[]) => {
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

    editMainInfoMutation.mutate({ skillSlugs: slugs });
  };

  return (
    <SSection header="Навыки" footer={skillsError}>
      <Multiselect
        status={skillsError ? "error" : "default"}
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        selectedBehavior="hide"
        closeDropdownAfterSelect={false}
        creatable={false}
        placeholder={
          isLoading ? "Загружаем навыки..." : "Выберите до 10 навыков"
        }
      />
    </SSection>
  );
};

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