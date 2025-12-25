import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuthUser, useEditUserMainInfo } from "@/entities/user";
import { MAX_BIO } from "./types";
import { postEvent } from "@tma.js/sdk-react";

export function useProfileBioEditor() {
  const { data: user } = useAuthUser();
  const edit = useEditUserMainInfo();

  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  const lastSavedRef = useRef("");
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const initial = user.bio ?? "";
    setBio(initial);
    setError(null);
    lastSavedRef.current = initial;
    initializedRef.current = true;
  }, [user?.id]); // важно: не на весь user объект

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setBio(next);

    if (next.length > MAX_BIO) {
      setError(`Описание должно быть не больше ${MAX_BIO} символов`);
      try {
        postEvent("web_app_trigger_haptic_feedback", {
          type: "impact",
          impact_style: "light",
        });
      } catch (error) {
        console.debug("Haptic feedback not available", error);
      }
    } else setError(null);
  };

  useEffect(() => {
    if (!initializedRef.current) return;
    if (!user) return;
    if (error) return;

    const lastSaved = lastSavedRef.current;
    if (bio === lastSaved) return;

    const t = window.setTimeout(() => {
      edit.mutate(
        { bio: bio },
        { onSuccess: () => (lastSavedRef.current = bio) }
      );
    }, 600);

    return () => window.clearTimeout(t);
  }, [bio, error, user?.id, edit]);

  return {
    bio,
    error,
    isSaving: edit.isPending,
    onChange,
  };
}
