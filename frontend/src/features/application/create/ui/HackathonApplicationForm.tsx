import styled from "styled-components";
import { Button, Input, List, Select } from "@telegram-apps/telegram-ui";
import { FC } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import { roleOptions } from "@/shared/types/enums";
import type { Role } from "@/shared/types/enums";
import { InputSection } from "@/shared/ui";

interface HackathonApplicationFormProps {
  hackathon: Hackathon;
  role: Role | "";
  submitLabel: string;
  loading?: boolean;
  canSubmit: boolean;
  onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export const HackathonApplicationForm: FC<HackathonApplicationFormProps> = ({
  hackathon,
  role,
  submitLabel,
  loading = false,
  canSubmit,
  onRoleChange,
  onSubmit,
  onCancel,
}) => {
  const handleSaveClick = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <>
      <InputSection header={"Хакатон"}>
        <Input type="text" value={hackathon.name} disabled />
      </InputSection>
      <InputSection header={"Роль"}>
        <Select value={role} onChange={onRoleChange}>
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

      <ButtonsSection>
        <Button
          size="l"
          onClick={handleSaveClick}
          stretched
          disabled={!canSubmit || loading}
        >
          {submitLabel}
        </Button>

        {onCancel && (
          <Button
            size="l"
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

const ButtonsSection = styled(List)`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

