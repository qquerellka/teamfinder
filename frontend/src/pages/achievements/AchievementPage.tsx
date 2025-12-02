import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  Input,
  List,
  Section,
  Select,
} from "@telegram-apps/telegram-ui";

import { STitle } from "@/shared/ui/STitle";
import { useAuthUser } from "@/entities/user/api/hooks";
import type { Achievement } from "@/entities/achievement/model/types";
import {
  useEditAchievement,
  useDeleteAchievement,
} from "@/entities/achievement/api/hooks";

type AchievementPlace = Achievement["place"];

const placeOptions: { label: string; value: AchievementPlace }[] = [
  { label: "1 место", value: "firstPlace" },
  { label: "2 место", value: "secondPlace" },
  { label: "3 место", value: "thirdPlace" },
  { label: "Участник", value: "participant" },
];

const roleOptions: { label: string; value: string }[] = [
  { label: "Backend", value: "Backend" },
  { label: "Frontend", value: "Frontend" },
  { label: "Fullstack", value: "Fullstack" },
  { label: "Data / ML", value: "Data" },
  { label: "Product", value: "Product" },
  { label: "Designer", value: "Designer" },
];

const AchievementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: user } = useAuthUser();
  const editAchievementMutation = useEditAchievement();
  const deleteAchievementMutation = useDeleteAchievement();

  const achievement = useMemo(
    () => user?.achievements.find((a) => a.id === Number(id)),
    [user, id],
  );

  const [role, setRole] = useState<string>("");
  const [place, setPlace] = useState<AchievementPlace | "">("");

  useEffect(() => {
    if (!achievement) return;
    setRole(achievement.role ?? "");
    setPlace(achievement.place ?? "");
  }, [achievement]);

  if (!achievement) {
    return (
      <section style={{ padding: "1.5rem" }}>
        <STitle $fs={20} $fw={600}>
          Достижение не найдено
        </STitle>
      </section>
    );
  }

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handlePlaceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPlace(e.target.value as AchievementPlace | "");
  };

  const handleSave = () => {
    editAchievementMutation.mutate(
      {
        id: achievement.id,
        patch: {
          role,
          place: place as Achievement["place"],
        },
      },
      {
        onSuccess: () => navigate(-1),
      },
    );
  };

  const handleDelete = () => {
    deleteAchievementMutation.mutate(achievement.id, {
      onSuccess: () => navigate(-1),
    });
  };

  return (
    <SProfile>
      <Wrapper>
        <STitle $fs={14} $fw={"semibold"}>
          Редактировать достижение
        </STitle>

        {/* Хакатон */}
        <SSection header="Хакатон">
          <List>
            <Input
              value={achievement.hackathonName ?? ""}
              disabled
              placeholder="Название хакатона"
            />
          </List>
        </SSection>

        {/* Роль */}
        <SSection header="Роль в команде">
          <List>
            <SSelect value={role} onChange={handleRoleChange}>
              <option value="" disabled>
                Выберите роль
              </option>
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SSelect>
          </List>
        </SSection>

        {/* Место */}
        <SSection header="Место">
          <List>
            <Select value={place} onChange={handlePlaceChange}>
              <option value="" disabled>
                Выберите место
              </option>
              {placeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </List>
        </SSection>

        {/* Кнопки */}
        <SSection>
          <List>
            <Button size="l" onClick={handleSave} stretched>
              Сохранить
            </Button>
            <DeleteButton size="l" onClick={handleDelete} stretched>
              Удалить
            </DeleteButton>
          </List>
        </SSection>
      </Wrapper>
    </SProfile>
  );
};

const SProfile = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 0;
  gap: 1.5rem;
`;

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0rem;
  align-items: center;
`;

const SSection = styled(Section)`
  background: var(--tg-theme-section-bg-color, #fff);
  padding: 0;
  border-radius: 1rem;
  width: 100%;

  & > div {
    padding: 0;
  }
`;

const SSelect = styled(Select)`
  width: 100%;
`;

const DeleteButton = styled(Button)`
  margin-top: 0.75rem;
  background-color: var(--tg-theme-destructive-text-color);
`;

export default AchievementPage;
