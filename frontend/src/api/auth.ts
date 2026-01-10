// API credentials for Basic Auth
const API_USERNAME = 'admin';
const API_PASSWORD = 'bookstore123';

export const getAuthHeader = () => {
  const credentials = btoa(`${API_USERNAME}:${API_PASSWORD}`);
  return {
    'Authorization': `Basic ${credentials}`
  };
};

export const fetchWithAuth = (url: string, options?: RequestInit) => {
  const headers = {
    ...getAuthHeader(),
    ...(options?.headers || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
};
