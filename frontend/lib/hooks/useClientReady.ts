"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** Avoid showing an access-denied state before browser session storage is read. */
export function useClientReady() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
