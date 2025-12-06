import styled from "styled-components";
import { Button, Input, List, Select } from "@telegram-apps/telegram-ui";

import { Hackathon } from "@/entities/hackathon/model/types";
import { roleOptions } from "@/shared/types/enums";
import { useHackathonApplicationCreateForm } from "../hooks/useHackathonApplicationCreateForm";
import { FC } from "react";

interface HackathonApplicationCreateFormProps {
  hackathon: Hackathon;
};

export const HackathonApplicationCreateForm:FC<HackathonApplicationCreateFormProps> = ({ hackathon }) => {
  const { role, handleRoleChange, handleSave, canSubmit, isSubmitting } =
    useHackathonApplicationCreateForm(hackathon.id);

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
          onClick={handleSave}
          stretched
          disabled={!canSubmit || isSubmitting}
        >
          Сохранить
        </Button>
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
