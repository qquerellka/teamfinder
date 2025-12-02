// src/pages/achievement/AchievementPage.tsx
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
  useCreateAchievement,
} from "@/entities/achievement/api/hooks";
import { useHackathonsQuery } from "@/entities/hackathon/api/hooks"; // путь проверь

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
  const isNew = !id || id === "new";

  const { data: user } = useAuthUser();
  const { data: hackathons } = useHackathonsQuery();

  const editAchievementMutation = useEditAchievement();
  const deleteAchievementMutation = useDeleteAchievement();
  const createAchievementMutation = useCreateAchievement();

  const achievement = useMemo(
    () =>
      isNew
        ? null
        : user?.achievements.find((a) => a.id === Number(id)) ?? null,
    [user, id, isNew]
  );

  const [hackathonId, setHackathonId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [place, setPlace] = useState<AchievementPlace | "">("");

  useEffect(() => {
    if (!achievement || isNew) return;
    setRole(achievement.role ?? "");
    setPlace(achievement.place ?? "");
  }, [achievement, isNew]);

  // если редактирование и не нашли достижение
  if (!isNew && !achievement) {
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

  const handleHackathonChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setHackathonId(e.target.value);
  };

  const handleSave = () => {
    // простая валидация
    if (!role || !place || (isNew && !hackathonId)) {
      // сюда можно добавить тост/алерт
      return;
    }

    if (isNew) {
      // перед этим в handleSave ты уже проверяешь, что hackathonId, role и place заданы
      createAchievementMutation.mutate(
        {
          hackathonId: Number(hackathonId),
          role,
          place: place as Achievement["place"],
        },
        {
          onSuccess: () => navigate(-1),
        }
      );
    } else if (achievement) {
      // редактирование — меняем только роль и место
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
        }
      );
    }
  };

  const handleDelete = () => {
    if (!achievement) return;
    deleteAchievementMutation.mutate(achievement.id, {
      onSuccess: () => navigate(-1),
    });
  };

  return (
    <SProfile>
      <Wrapper>
        <STitle $fs={14} $fw={"semibold"}>
          {isNew ? "Новое достижение" : "Редактировать достижение"}
        </STitle>

        <SSection header="Хакатон">
          <List>
            {isNew ? (
              <SSelect value={hackathonId} onChange={handleHackathonChange}>
                <option value="" disabled>
                  Выберите хакатон
                </option>
                {hackathons?.items.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </SSelect>
            ) : (
              <Input
                value={achievement?.hackathonName ?? ""}
                disabled
                placeholder="Название хакатона"
              />
            )}
          </List>
        </SSection>

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

        <SSection>
          <List>
            <Button size="l" onClick={handleSave} stretched>
              {isNew ? "Добавить" : "Сохранить"}
            </Button>

            {!isNew && (
              <DeleteButton size="l" onClick={handleDelete} stretched>
                Удалить
              </DeleteButton>
            )}
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
