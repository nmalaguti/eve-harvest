import { sortBy, uniq } from "lodash"
import oresList from "./ores.json"
import { localeSort, numericSort } from "./sortFunctions"

export { oresList }

export { default as mineralsList } from "./minerals.json"

export const ores: Map<number, Ore> = new Map(
  oresList.map((ore) => [ore.id, ore]),
)
export const primaryOres: Ore[] = sortBy(
  uniq(oresList.map((ore) => ore.primaryOreId)).map((id) => ores.get(id)!),
  (ore: Ore) => ore.name,
)
export const fetcher = (url: string) => fetch(url).then((res) => res.json())
export const getOrePrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
): number => {
  const primary = ores.get(ore.primaryOreId)!
  if (priceMap[ore.id][buysell].percentile > 0) {
    return (
      priceMap[ore.id][buysell].percentile / ore.compressAmount / primary.volume
    )
  } else {
    return 0
  }
}
export const getMineralsPrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
  refinePercent: number,
): number => {
  const primary = ores.get(ore.primaryOreId)!
  return (
    Object.entries(ore.minerals || {})
      .map(
        ([mineralId, amount]) =>
          (priceMap[mineralId][buysell].percentile * amount!) /
          primary.refineAmount /
          primary.volume,
      )
      .reduce((a, b) => a + b, 0) * refinePercent
  )
}
export const columns = [
  {
    name: "Ore Name",
    selector: "displayName",
    sortable: true,
    sortFunction: localeSort("name"),
    grow: 2,
    wrap: true,
  },
  {
    name: "Group",
    selector: "displayGroup",
    sortable: true,
    sortFunction: localeSort("group"),
    width: "80px",
    wrap: true,
  },
  {
    name: "Buy Price",
    selector: "displayBuy",
    sortable: true,
    sortFunction: numericSort("buy"),
    wrap: true,
  },
  {
    name: "Minerals Buy Price",
    selector: "displayMineralsBuy",
    sortable: true,
    sortFunction: numericSort("mineralsBuy"),
    wrap: true,
  },
  {
    name: "Perfect Minerals Buy Price",
    selector: "displayPerfectMineralsBuy",
    sortable: true,
    sortFunction: numericSort("perfectMineralsBuy"),
    wrap: true,
  },
  {
    name: "Sell Price",
    selector: "displaySell",
    sortable: true,
    sortFunction: numericSort("sell"),
    wrap: true,
  },
  {
    name: "Minerals Sell Price",
    selector: "displayMineralsSell",
    sortable: true,
    sortFunction: numericSort("mineralsSell"),
    wrap: true,
  },
  {
    name: "Perfect Minerals Sell Price",
    selector: "displayPerfectMineralsSell",
    sortable: true,
    sortFunction: numericSort("perfectMineralsSell"),
    wrap: true,
  },
]
export const initialState = primaryOres
  .map((ore) => ({ [ore.id]: true }))
  .reduce((a, b) => ({ ...a, ...b }), {})
