export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function absoluteUrl(baseUrl: string, path: string): string {
  const url = new URL(path, `${baseUrl.replace(/\/+$/, '')}/`);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Unsupported URL protocol: ${url.protocol}`);
  }
  return url.toString();
}
