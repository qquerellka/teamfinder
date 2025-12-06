import { useEffect, useState, ChangeEvent } from "react";
import { useAuthUser, useEditUserMainInfo } from "@/entities/user/api/hooks";

const MAX_BIO = 256;

export function useProfileBioEditor() {
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

    const timeoutId = window.setTimeout(() => {
      editMainInfoMutation.mutate(
        { bio: bio || undefined },
        {
          onSuccess: () => setLastSavedBio(bio),
        },
      );
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [bio, bioError, isInitialized, user, lastSavedBio, editMainInfoMutation]);

  return {
    bio,
    bioError,
    handleChange,
    isSaving: editMainInfoMutation.isPending,
  };
}
