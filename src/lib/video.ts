/** Resolve public YouTube links at build time, without a player SDK. */
export function youtubeEmbedUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1];
  } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    const [, type, pathId] = url.pathname.split('/');
    id = ['embed', 'shorts', 'live'].includes(type) ? pathId : url.searchParams.get('v');
  }

  if (!id || !/^[\w-]{11}$/.test(id)) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    disablekb: '1',
    fs: '0',
    playsinline: '1',
    rel: '0',
    iv_load_policy: '3',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
