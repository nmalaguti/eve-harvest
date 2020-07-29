import { createLocalStorageStateHook } from "use-local-storage-state"
import { dataFactory, primaryOres } from "./data"
import oresList from "./json/ores.json"
import uniq from "lodash.uniq"
import useSWR from "swr"
import { useMemo } from "react"
import { createContainer } from "unstated-next"

const initialFiltersState = primaryOres
  .map((ore) => ({ [ore.id.toString()]: true }))
  .reduce((a, b) => ({ ...a, ...b }), {})

export const useOreFilters = createLocalStorageStateHook(
  "oreFilters",
  initialFiltersState,
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
