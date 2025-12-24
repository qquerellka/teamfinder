import styled from "styled-components";
import { Button, Select, Textarea } from "@telegram-apps/telegram-ui";
import type { FC, ChangeEvent } from "react";

import { roleOptions, type Role } from "@/shared/types/enums";
import { InputSection } from "@/shared/ui";

interface VacancyFormViewProps {
  role: Role | "";
  description: string;
  submitLabel: string;
  loading?: boolean;
  canSubmit: boolean;
  onRoleChange: (role: Role | "") => void;
  onDescriptionChange: (decription: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

const parseRole = (raw: string): Role | "" => (raw ? (raw as Role) : "");

export const VacancyFormView: FC<VacancyFormViewProps> = ({
  role,
  description,
  submitLabel,
  loading = false,
  canSubmit,
  onRoleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}) => {
  const handleSaveClick = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    onRoleChange(parseRole(e.target.value));
  };

  const handleTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  };

  return (
    <>
      <InputsWrapper>
        <InputSection header={"Описание"}>
          <Textarea
            value={description}
            onChange={handleTextarea}
            placeholder="Хотим заряженного ИБО перваша"
          />
        </InputSection>

        <InputSection header={"Роль"}>
          <Select value={role} onChange={handleSelect}>
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
      </InputsWrapper>
      <ButtonsSection>
        <Button
          onClick={handleSaveClick}
          stretched
          disabled={!canSubmit || loading}
        >
          {submitLabel}
        </Button>

        {onCancel && (
          <Button
            mode="bezeled"
            stretched
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </Button>
        )}
      </ButtonsSection>
    </>
  );
};

const ButtonsSection = styled.div`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`