const DJ_TOKEN_KEY = 'dj_access_token';

export function getDJToken() {
  return sessionStorage.getItem(DJ_TOKEN_KEY);
}

export function setDJToken(token) {
  sessionStorage.setItem(DJ_TOKEN_KEY, token);
}

export function clearDJToken() {
  sessionStorage.removeItem(DJ_TOKEN_KEY);
}

export function requireDJToken() {
  const token = getDJToken();
  if (!token) {
    throw new Error('DJ authentication token is missing.');
  }
  return token;
}
