import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

// False on the server and during hydration, true afterwards. Forms use it to
// lock their fields until React has taken over: text typed earlier is thrown
// away or replaced by the stored value when the fields are hydrated.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
