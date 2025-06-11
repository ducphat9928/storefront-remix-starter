import { LocalStorageKey } from '~/constants';
import { queryClient } from '~/root';

export function setLocalStorage<T = any>(key: LocalStorageKey, data: T) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function getLocalStorage<T = any>(key: LocalStorageKey) {
  if (typeof localStorage !== 'undefined') {
    const profileLs = localStorage.getItem(key);
    return profileLs ? (JSON.parse(profileLs) as T) : null;
  }
  return null;
}

export const LocalStorageEventTarget = new EventTarget();

export const clearLocalStorage = () => {
  localStorage.removeItem(LocalStorageKey.AuthToken);
  localStorage.removeItem(LocalStorageKey.Profile);
  localStorage.removeItem(LocalStorageKey.Cache);
  queryClient.removeQueries();
  setLocalStorage(LocalStorageKey.IsLoign, false);
  const clearLSEvent = new Event('clearLS');
  LocalStorageEventTarget.dispatchEvent(clearLSEvent);
};
