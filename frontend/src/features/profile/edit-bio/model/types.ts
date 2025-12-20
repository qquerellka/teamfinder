export const MAX_BIO = 256;

export type BioEditorState = {
  bio: string;
  error: string | null;
  isSaving: boolean;
};
