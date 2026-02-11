import { useState, useRef, useCallback } from "react";

export default function useTyping() {
  const [typing, setTyping] = useState([]);
  const timers = useRef({});

  const add = useCallback((username) => {
    setTyping((prev) => prev.includes(username) ? prev : [...prev, username]);
    clearTimeout(timers.current[username]);
    timers.current[username] = setTimeout(() => {
      setTyping((prev) => prev.filter((u) => u !== username));
    }, 2000);
  }, []);

  return [typing, add];
}
