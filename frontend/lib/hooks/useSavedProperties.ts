"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseSavedProperties, SAVED_PROPERTIES_KEY, updateSavedProperties } from "@/lib/saved-properties";

const CHANGE_EVENT = "buildup:saved-properties-changed";
const serverSnapshot = () => null;

function snapshot() {
  try {
    return localStorage.getItem(SAVED_PROPERTIES_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SAVED_PROPERTIES_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function toggleSavedProperty(id: string) {
  try {
    const current = parseSavedProperties(localStorage.getItem(SAVED_PROPERTIES_KEY));
    const change = updateSavedProperties(current, id);
    if (change.result === "limit") return "limit";
    localStorage.setItem(SAVED_PROPERTIES_KEY, JSON.stringify(change.ids));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return change.result;
  } catch {
    return "unavailable";
  }
}

export function useSavedProperties() {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ids = useMemo(() => parseSavedProperties(value), [value]);
  return { ids, ready: value !== null };
}
