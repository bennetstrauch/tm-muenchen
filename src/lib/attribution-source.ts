const ALLOWED_KEYS = [
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  '_ad',
];

function safePath(path: string): string {
  const valid =
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !/[\x00-\x1f]/.test(path);
  return valid ? path : '/';
}

const MAX_LENGTH = 512;

function clean(value: string): string {
  return value.replace(/[\x00-\x1f]/g, '');
}

export function buildSource(
  host: string,
  path: string,
  params: Record<string, string>,
): string {
  const query = ALLOWED_KEYS.filter(k => k in params)
    .map(k => `${k}=${clean(params[k])}`)
    .join('&');

  const source = `https://${host}${safePath(path)}${query ? `?${query}` : ''}`;
  return source.slice(0, MAX_LENGTH);
}
