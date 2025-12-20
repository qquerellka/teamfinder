import { useEffect, useMemo, useRef, useState } from "react";
import type { MultiselectProps } from "@telegram-apps/telegram-ui";

import { useAuthUser, useEditUserMainInfo } from "@/entities/user";
import { useSkills, type Skill } from "@/entities/skill";
import { MAX_SKILLS } from "./types";

type Option = MultiselectProps["options"][number];

const toOptions = (skills: Skill[]): Option[] =>
  skills.map((s) => ({ value: s.slug, label: s.name }));

const sameSet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
};

export function useProfileSkillsEditor() {
  const { data: user } = useAuthUser();
  const { data: skills = [], isLoading } = useSkills();
  const edit = useEditUserMainInfo();

  const [error, setError] = useState<string | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const lastSavedRef = useRef<string[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const fromUser = user.skills.map((s) => s.slug);

    setSelectedSlugs(fromUser);
    lastSavedRef.current = fromUser;
    setError(null);
    initializedRef.current = true;
  }, [user?.id]);

  const options = useMemo(() => toOptions(skills), [skills]);

  const value = useMemo(
    () => options.filter((o) => selectedSlugs.includes(String(o.value))),
    [options, selectedSlugs]
  );

  const onChange = (selected: Option[]) => {
    if (selected.length > MAX_SKILLS) {
      setError(`Нельзя выбрать больше ${MAX_SKILLS} навыков`);
      return;
    }

    const slugs = selected.map((o) => String(o.value));
    if (sameSet(slugs, lastSavedRef.current)) return;

    setSelectedSlugs(slugs);
    setError(null);

    if (!initializedRef.current || !user) return;

    edit.mutate(slugs.length ? { skillSlugs: slugs } : { skillSlugs: [] }, {
      onSuccess: () => {
        lastSavedRef.current = slugs;
      },
    });
  };

  return {
    options,
    value,
    isLoading,
    isSaving: edit.isPending,
    error,
    onChange,
  };
}
