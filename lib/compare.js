"use client";
import { useEffect, useState } from "react";
const KEY = "sdmap_compare";
export function getCompare() { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function useCompare() {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    setIds(getCompare());
    const h = () => setIds(getCompare());
    window.addEventListener("storage", h); window.addEventListener("sdmap-compare", h);
    return () => { window.removeEventListener("storage", h); window.removeEventListener("sdmap-compare", h); };
  }, []);
  const toggle = (id) => { let c = getCompare(); c = c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-4); localStorage.setItem(KEY, JSON.stringify(c)); window.dispatchEvent(new Event("sdmap-compare")); };
  return { ids, toggle, has: (id) => ids.includes(id) };
}
