import { useEffect, useRef, useState } from 'react';
import { getTeamJoinLink } from '@/entities/team';

async function copyToClipboard(text: string): Promise<boolean> {
  // 1) modern API
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error: unknown) {
    console.error(error);
  }

  // 2) iOS fallback
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';

    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length); // важно для iOS

    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function useCopyTeamInviteLink(teamId: number) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;

    setIsLoadingUrl(true);
    getTeamJoinLink(teamId)
      .then(u => {
        if (alive) setUrl(u);
      })
      .finally(() => {
        if (alive) setIsLoadingUrl(false);
      });

    return () => {
      alive = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [teamId]);

  const copy = async () => {
    if (!url) return; // кнопку лучше disabled пока url нет

    setIsCopying(true);
    try {
      const ok = await copyToClipboard(url);
      if (!ok) {
        // тут можно открыть модалку с ссылкой для ручного копирования
        return;
      }

      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsCopying(false);
    }
  };

  return {
    copy,
    copied,
    isCopying: isCopying || isLoadingUrl,
    isReady: Boolean(url),
    url, // пригодится для fallback UI
  };
}
