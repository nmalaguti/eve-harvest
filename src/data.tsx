import uniq from "lodash.uniq"
import sortBy from "lodash.sortby"
import oresList from "./ores.json"
import { localeSort, numericSort } from "./sortFunctions"
import React from "react"
import { Bonus } from "./bonus"
import { Icon } from "./icon"
import { IskM3 } from "./isk-m3"

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
): number => {
  const primary = ores.get(ore.primaryOreId)!
  return Object.entries(ore.minerals || {})
    .map(
      ([mineralId, amount]) =>
        (priceMap[mineralId][buysell].percentile * amount!) /
        primary.refineAmount /
        primary.volume,
    )
    .reduce((a, b) => a + b, 0)
}

type OrePriceNumberKeys = {
  [K in keyof OrePrice]: OrePrice[K] extends number ? K : never
}[keyof OrePrice]

const iskCell = (selector: OrePriceNumberKeys) => (row: OrePrice) => (
  <div>
    <IskM3 value={row[selector]} />
  </div>
)

export const columns = [
  {
    name: "Ore Name",
    selector: "name",
    sortable: true,
    sortFunction: localeSort("name"),
    grow: 2,
    wrap: true,
    cell: (row: OrePrice) => (
      <div>
        <a
          href={`https://evemarketer.com/types/${row.id}/history`}
          title={`${row.name} Price History`}
        >
          {row.name}
        </a>{" "}
        <Bonus amount={row.bonus} />
      </div>
    ),
  },
  {
    name: "Group",
    selector: "group",
    sortable: true,
    sortFunction: localeSort("group"),
    width: "80px",
    wrap: true,
    cell: (row: OrePrice) => (
      <div>
        <a href={`https://eveinfo.com/item/${row.id}/`}>
          <Icon
            id={row.id}
            name={row.name}
            style={{ backgroundColor: row.color }}
          />
        </a>
      </div>
    ),
  },
  {
    name: "Buy Price",
    selector: "buy",
    sortable: true,
    sortFunction: numericSort("buy"),
    wrap: true,
    cell: iskCell("buy"),
  },
  {
    name: "Minerals Buy Price",
    selector: "mineralsBuy",
    sortable: true,
    sortFunction: numericSort("mineralsBuy"),
    wrap: true,
    cell: iskCell("mineralsBuy"),
  },
  {
    name: "Perfect Minerals Buy Price",
    selector: "perfectMineralsBuy",
    sortable: true,
    sortFunction: numericSort("perfectMineralsBuy"),
    wrap: true,
    cell: iskCell("perfectMineralsBuy"),
  },
  {
    name: "Sell Price",
    selector: "sell",
    sortable: true,
    sortFunction: numericSort("sell"),
    wrap: true,
    cell: iskCell("sell"),
  },
  {
    name: "Minerals Sell Price",
    selector: "mineralsSell",
    sortable: true,
    sortFunction: numericSort("mineralsSell"),
    wrap: true,
    cell: iskCell("mineralsSell"),
  },
  {
    name: "Perfect Minerals Sell Price",
    selector: "perfectMineralsSell",
    sortable: true,
    sortFunction: numericSort("perfectMineralsSell"),
    wrap: true,
    cell: iskCell("perfectMineralsSell"),
  },
]

export const initialState = primaryOres
  .map((ore) => ({ [ore.id.toString()]: true }))
  .reduce((a, b) => ({ ...a, ...b }), {})
