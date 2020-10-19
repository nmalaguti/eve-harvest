import { createLocalStorageStateHook } from "use-local-storage-state"
import { dataFactory, oreGroups, oreBonuses, oreAvailability } from "./data"
import oresList from "./json/ores.json"
import uniq from "lodash.uniq"
import useSWR from "swr"
import { useMemo } from "react"
import { createContainer } from "unstated-next"
import flatMap from "array.prototype.flatmap"

flatMap.shim()

const initialOreFiltersState = oreGroups
  .map((group) => ({ [group.name]: true }))
  .reduce((a, b) => ({ ...a, ...b }), {})

export const useOreFilters = createLocalStorageStateHook(
  "oreFilters",
  initialOreFiltersState,
)

const initialBonusFiltersState = oreBonuses
  .map((bonus) => ({ [bonus]: true }))
  .reduce((a, b) => ({ ...a, ...b }), {})

export const useBonusFilters = createLocalStorageStateHook(
  "bonusFilters",
  initialBonusFiltersState,
)

const initialCompressedFiltersState: { [key: string]: boolean } = {
  true: true,
  false: true,
}

export const useCompressedFilters = createLocalStorageStateHook(
  "compressedFilters",
  initialCompressedFiltersState,
)

const initialAvailabilityFiltersState = oreAvailability
  .map((availableIn) => ({ [availableIn]: true }))
  .reduce((a, b) => ({ ...a, ...b }), {})

export const useAvailabilityFilters = createLocalStorageStateHook(
  "availabilityFilters",
  initialAvailabilityFiltersState,
)

export const fetcher = (url: string) => fetch(url).then((res) => res.json())

const allItems = (oresList as Id[]).concat(
  uniq(oresList.flatMap((ore) => Object.keys(ore.minerals))).map((id) => ({
    id: +id,
  })),
)
const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${allItems
  .map(({ id }) => id)
  .join(",")}`

function usePrices() {
  const { data: priceMap, error } = useSWR(url, fetcher, {
    refreshInterval: 600_000, // 10 mins
    focusThrottleInterval: 60_000, // 1 min
  })

  const data = useMemo(() => dataFactory(priceMap), [priceMap])

  return { data, error }
}

export const Prices = createContainer(usePrices)
