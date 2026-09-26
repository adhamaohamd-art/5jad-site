// بيحوّل رابط يوتيوب/فيميو/درايف عادي لرابط قابل للتضمين (embed) جوه iframe
export function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/embed/')) return url;
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith('/shorts/')) {
        const shortId = u.pathname.split('/')[2];
        if (shortId) return `https://www.youtube.com/embed/${shortId}`;
      }
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === 'drive.google.com') {
      if (u.pathname.includes('/preview')) return url;
      return url.replace('/view', '/preview');
    }
    return url;
  } catch {
    return url;
  }
}
