export function cookieValue(request, name) {
  const prefix = `${name}=`;
  return request.headers.cookie
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(prefix))
    ?.slice(prefix.length);
}
