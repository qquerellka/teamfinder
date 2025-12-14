import { useRef, useState } from "react";
import { getTeamJoinLink } from "@/entities/team";

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function useCopyTeamInviteLink(teamId: number) {
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const copy = async () => {
    try {
      setIsCopying(true);
      const url = await getTeamJoinLink(teamId);
      await copyToClipboard(url);

      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsCopying(false);
    }
  };

  return { copy, isCopying, copied };
}
