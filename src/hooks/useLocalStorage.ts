import { useEffect, useState } from 'react';
// Hook from useHooks! (https://usehooks.com/useLocalStorage/)
export default function useLocalStorage<T>(key: string, initialValue?: any) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>();
  
  useEffect(() => {
    let value;
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      value = item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      value = initialValue;
    }
    setStoredValue(value)
  }, [initialValue, key])

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: (arg0: any) => any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
