export namespace StorageUtil {
  export const setLocal = (key: string, value: string) => {
    if (!key) {
      return;
    }
    localStorage.setItem(key, value);
  };
  export const getLocal = (key: string): string => {
    if (!key) {
      return null;
    }
    return localStorage.getItem(key);
  };
  export const deleteLocal = (key: string) => {
    if (!key) {
      return;
    }
    localStorage.removeItem(key);
  };
  export const clearLocal = () => localStorage.clear();

  export const setSession = (key: string, value: string) => {
    if (!key) {
      return;
    }
    sessionStorage.setItem(key, value);
  };
  export const getSession = (key: string): string => {
    if (!key) {
      return null;
    }
    return sessionStorage.getItem(key);
  };
  export const deleteSession = (key: string) => {
    if (!key) {
      return;
    }
    sessionStorage.removeItem(key);
  };
  export const clearSession = () => sessionStorage.clear();
}
