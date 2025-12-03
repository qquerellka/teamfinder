import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Multiselect,
  MultiselectProps,
  Section,
} from "@telegram-apps/telegram-ui";

import { useAuthUser, useEditUserMainInfo } from "@/entities/user/api/hooks";
import { useSkills } from "@/entities/skill/api/hooks";
import type { Skill } from "@/entities/skill/model/types";

const MAX_SKILLS = 10;
type MultiSelectOption = MultiselectProps["options"][number];

function areArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export const ProfileSkillsEditor = () => {
  console.log("afasdgsag")
  const { data: user } = useAuthUser();
  const { data: skills = [], isLoading } = useSkills();
  const editMainInfoMutation = useEditUserMainInfo();

  const [selectedSkillSlugs, setSelectedSkillSlugs] = useState<string[]>([]);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedSlugs, setLastSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fromUser = user.skills.map((s) => s.slug);

    setSelectedSkillSlugs(fromUser);
    setLastSavedSlugs(fromUser);
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
    selectedSkillSlugs.includes(String(opt.value))
  );

  const handleChange = (selected: MultiSelectOption[]) => {
    console.log("asdfa");
    if (selected.length > MAX_SKILLS) {
      setSkillsError(`Нельзя выбрать больше ${MAX_SKILLS} навыков`);
      return;
    }

    const slugs = selected.map((o) => String(o.value));

    if (areArraysEqual(slugs, lastSavedSlugs)) return;

    setSelectedSkillSlugs(slugs);
    setSkillsError(null);

    if (!isInitialized || !user) return;

    editMainInfoMutation.mutate(
      { skillSlugs: slugs },
      {
        onSuccess: () => {
          setLastSavedSlugs(slugs);
        },
      }
    );
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
