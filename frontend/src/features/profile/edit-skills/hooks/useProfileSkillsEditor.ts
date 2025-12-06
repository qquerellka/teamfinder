import { useEffect, useState } from "react";
import type { MultiselectProps } from "@telegram-apps/telegram-ui";

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

function skillsToOptions(skills: Skill[]): MultiSelectOption[] {
  return skills.map((s) => ({
    value: s.slug,
    label: s.name,
  }));
}

export function useProfileSkillsEditor() {
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

  const options = skillsToOptions(skills);
  const selectedOptions: MultiSelectOption[] = options.filter((opt) =>
    selectedSkillSlugs.includes(String(opt.value)),
  );

  const handleChange = (selected: MultiSelectOption[]) => {
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
      },
    );
  };

  return {
    options,
    selectedOptions,
    isLoading,
    skillsError,
    handleChange,
  };
}
