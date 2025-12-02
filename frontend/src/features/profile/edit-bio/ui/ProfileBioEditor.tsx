import { useEffect, useState, ChangeEvent } from "react";
import styled from "styled-components";
import { Section, Textarea } from "@telegram-apps/telegram-ui";

import { useAuthUser, useEditUserMainInfo } from "@/entities/user/api/hooks";

const MAX_BIO = 256;

export const ProfileBioEditor = () => {
  const { data: user } = useAuthUser();
  const editMainInfoMutation = useEditUserMainInfo();

  const [bio, setBio] = useState("");
  const [bioError, setBioError] = useState<string | null>(null);
  const [lastSavedBio, setLastSavedBio] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;
    const initialBio = user.bio ?? "";
    setBio(initialBio);
    setLastSavedBio(initialBio);
    setBioError(null);
    setIsInitialized(true);
  }, [user]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = event.target.value;
    setBio(newBio);

    if (newBio.length > MAX_BIO) {
      setBioError(`Описание должно быть не больше ${MAX_BIO} символов`);
    } else {
      setBioError(null);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;
    if (bioError) return;
    if (bio === lastSavedBio) return;

    const timeoutId = setTimeout(() => {
      editMainInfoMutation.mutate(
        { bio: bio || undefined },
        {
          onSuccess: () => setLastSavedBio(bio),
        },
      );
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [bio, bioError, isInitialized, user, lastSavedBio, editMainInfoMutation]);

  return (
    <SSection header="Обо мне" footer={bioError}>
      <Textarea
        status={bioError ? "error" : "default"}
        value={bio}
        onChange={handleChange}
        placeholder="Расскажите немного о себе..."
      />
    </SSection>
  );
};


const SSection = styled(Section)`
  background: var(--tg-theme-section-bg-color, #fff);
  padding: 1rem;
  border-radius: 1rem;
  & > div {
    display: flex;
    flex-direction: column;

    & > header {
      padding: 0;
      box-shadow: none;
    }
    & > div {
      padding: 0;
      & > div {
        background: var(--tg-theme-section-bg-color, #fff);
        padding: 1rem 0 1rem 0;
      }
    }
  }
  & > footer {
    padding-bottom: 0;
    & > h6 {
      color: var(--tg-theme-destructive-text-color, #fff);
    }
  }
`;