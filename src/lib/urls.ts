/** Handles both username.github.io and username.github.io/repository/. */
export function withBase(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export function assetUrl(path: string) {
  return /^https?:\/\//i.test(path) || path === '' ? path : withBase(path);
}
