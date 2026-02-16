import { useMemo } from 'react';
import type { MultiselectProps } from '@telegram-apps/telegram-ui';

import { useSkills, type Skill } from '@/entities/skill';
import { ProfileSkillsEditorView } from './ProfileSkillsEditorView';

type Option = MultiselectProps['options'][number];

const toOptions = (skills: Skill[]): Option[] =>
  skills.map(s => ({ value: s.slug, label: s.name }));

export const ProfileSkillsReadonly = ({ skills }: { skills: Skill[] }) => {
  const { data: allSkills = [], isLoading } = useSkills();

  const baseOptions = useMemo(() => toOptions(allSkills), [allSkills]);

  const selectedFallback = useMemo(() => toOptions(skills ?? []), [skills]);

  const options = useMemo(() => {
    const map = new Map<string, Option>();
    for (const o of baseOptions) map.set(String(o.value), o);
    for (const o of selectedFallback) map.set(String(o.value), o);
    return Array.from(map.values());
  }, [baseOptions, selectedFallback]);

  const selectedSet = useMemo(() => new Set((skills ?? []).map(s => s.slug)), [skills]);

  const value = useMemo(
    () => options.filter(o => selectedSet.has(String(o.value))),
    [options, selectedSet],
  );

  return (
    <ProfileSkillsEditorView
      options={options}
      value={value}
      isLoading={isLoading}
      error={null}
      onChange={() => {}}
      disabled
    />
  );
};
