import { ChangeEvent, FC } from "react";
import styled from "styled-components";
import { Button, Input, Select } from "@telegram-apps/telegram-ui";

import { SText, InputSection } from "@/shared/ui";
import type { Hackathon } from "@/entities/hackathon/model/types";
import {
  AchievementPlace,
  placeOptions,
  roleOptions,
} from "@/shared/types/enums";
import type { AchievementFormValues } from "@/features/achievement/edit/hooks/useAchievementForm";

interface AchievementFormViewProps {
  isNew: boolean;
  achievementName?: string;
  hackathons: Hackathon[];
  values: AchievementFormValues;
  onChange: (
    field: keyof AchievementFormValues,
    value: string | AchievementPlace | ""
  ) => void;
  onSave: () => void;
  onDelete?: () => void;
  canSubmit: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}

export const AchievementFormView: FC<AchievementFormViewProps> = ({
  isNew,
  achievementName,
  hackathons,
  values,
  onChange,
  onSave,
  onDelete,
  canSubmit,
  isSaving,
  isDeleting,
}) => {
  if (!isNew && !achievementName) {
    return (
      <section style={{ padding: "1.5rem" }}>
        <SText $fs={20} $fw={600}>
          Достижение не найдено
        </SText> 
      </section>
    );
  }

  const handleSelect =
    (field: keyof AchievementFormValues) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange(field, e.target.value);
    };

  return (
    <SProfile>
      <Wrapper>
        <SText $fs={14} $fw="semibold">
          {isNew ? "Новое достижение" : "Редактировать достижение"}
        </SText>

        <InputSection header={"Хакатон"}>
          {isNew ? (
            <Select
              value={values.hackathonId}
              onChange={handleSelect("hackathonId")}
            >
              <option value="" disabled>
                Выберите хакатон
              </option>
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
          ) : (
            <Input value={achievementName ?? ""} disabled />
          )}
        </InputSection>

        <InputSection header={"Роль в команде"}>
          <Select value={values.role} onChange={handleSelect("role")}>
            <option value="" disabled>
              Выберите роль
            </option>
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </InputSection>

        <InputSection header={"Место"}>
          <Select value={values.place} onChange={handleSelect("place")}>
            <option value="" disabled>
              Выберите место
            </option>
            {placeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </InputSection>

        <ButtonsSection>
          <Button
            size="l"
            onClick={onSave}
            stretched
            disabled={!canSubmit || isSaving}
          >
            {isNew ? "Добавить" : "Сохранить"}
          </Button>

          {!isNew && onDelete && (
            <DeleteButton
              size="l"
              onClick={onDelete}
              stretched
              disabled={isDeleting}
            >
              Удалить
            </DeleteButton>
          )}
        </ButtonsSection>
      </Wrapper>
    </SProfile>
  );
};

const SProfile = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0 0;
  gap: 1.5rem;
  flex: 1;
`;

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0;
  align-items: center;
  flex: 1;
`;

const DeleteButton = styled(Button)`
  background-color: var(--tg-theme-destructive-text-color);
`;

const ButtonsSection = styled.section`
  width: 100%;
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
