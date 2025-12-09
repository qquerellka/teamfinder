import styled from "styled-components";
import { Button, Input, List, Select } from "@telegram-apps/telegram-ui";
import { FC, useState } from "react";

import { Hackathon } from "@/entities/hackathon/model/types";
import { roleOptions } from "@/shared/types/enums";
import type { Role } from "@/shared/types/enums";

interface HackathonApplicationFormProps {
  hackathon: Hackathon;
  initialRole: Role | "";
  submitLabel: string;
  loading?: boolean;
  onSubmit: (role: Role) => void | Promise<void>;
  onCancel?: () => void;
}

export const HackathonApplicationForm: FC<HackathonApplicationFormProps> = ({
  hackathon,
  initialRole,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const [role, setRole] = useState<Role | "">(initialRole);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role);
  };

  const canSubmit = Boolean(role) && !loading;

  const handleSaveClick = () => {
    if (!role) return;
    onSubmit(role);
  };

  return (
    <>
      <List>
        <Input type="text" value={hackathon.name} disabled />
        <Select value={role} onChange={handleRoleChange} header="Роль">
          <option value="" disabled>
            Выберите роль
          </option>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </List>

      <ButtonsSection>
        <Button
          size="l"
          onClick={handleSaveClick}
          stretched
          disabled={!canSubmit}
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
