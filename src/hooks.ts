import { createLocalStorageStateHook } from "use-local-storage-state"
import { initialState } from "./data"

export const useOreFilters = createLocalStorageStateHook(
  "oreFilters",
  initialState,
)
