import {
  columns,
  fetcher,
  getMineralsPrice,
  getOrePrice,
  mineralsList,
  ores,
  oresList,
} from "./data"
import { Bonus } from "./bonus"
import { Icon } from "./icon"
import { IskM3 } from "./isk-m3"
import React, { useMemo } from "react"
import useSWR from "swr"
import { useOreFilters } from "./hooks"
import useLocalStorageState from "use-local-storage-state"
import { Loading } from "./loading"
import DataTable from "react-data-table-component"
import { customStyles } from "./theme"
import { Filter } from "./filter"

function dataFactory(priceMap: Prices) {
  return (
    priceMap &&
    oresList.map((ore) => {
      const { id, name, bonus, primaryOreId } = ore
      const primaryOre = ores.get(primaryOreId)!
      const buy = getOrePrice(priceMap, ore, "buy")
      const mineralsBuy = getMineralsPrice(priceMap, ore, "buy", 0.7)
      const perfectMineralsBuy = getMineralsPrice(priceMap, ore, "buy", 0.8934)
      const sell = getOrePrice(priceMap, ore, "sell")
      const mineralsSell = getMineralsPrice(priceMap, ore, "sell", 0.7)
      const perfectMineralsSell = getMineralsPrice(
        priceMap,
        ore,
        "sell",
        0.8934,
      )

      return {
        id,
        name,
        displayName: (
          <>
            {name} <Bonus amount={bonus} />
          </>
        ),
        group: primaryOre.name,
        displayGroup: (
          <Icon id={id} name={name} style={{ backgroundColor: ore.color }} />
        ),
        buy,
        displayBuy: <IskM3 value={buy} />,
        mineralsBuy,
        displayMineralsBuy: <IskM3 value={mineralsBuy} />,
        perfectMineralsBuy,
        displayPerfectMineralsBuy: <IskM3 value={perfectMineralsBuy} />,
        sell,
        displaySell: <IskM3 value={sell} />,
        mineralsSell,
        displayMineralsSell: <IskM3 value={mineralsSell} />,
        perfectMineralsSell,
        displayPerfectMineralsSell: <IskM3 value={perfectMineralsSell} />,
        primaryOreId,
        bonus,
      }
    })
  )
}

export default function App() {
  const allItems = (oresList as Id[]).concat(mineralsList)
  const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${allItems
    .map(({ id }) => id)
    .join(",")}`
  const { data: priceMap, error } = useSWR(url, fetcher, {
    refreshInterval: 600_000, // 10 mins
    focusThrottleInterval: 60_000, // 1 min
  })

  const [state] = useOreFilters()
  const [sortField, setSortField] = useLocalStorageState("sortField", "buy")
  const [sortAsc, setSortAsc] = useLocalStorageState("sortAsc", false)

  const data = useMemo(() => dataFactory(priceMap), [priceMap])

  if (error) return <div className="p-4">failed to load</div>
  if (!data) return <Loading />

  return (
    <DataTable
      title="Eve Harvest"
      columns={columns}
      data={data
        .filter((ore) => ore.bonus < 0.15)
        .filter((ore) => state[ore.primaryOreId])}
      theme="custom"
      customStyles={customStyles}
      defaultSortField={sortField}
      defaultSortAsc={sortAsc}
      onSort={(column, sortDirection) => {
        setSortField(
          ((column?.selector as string | undefined) ?? "")
            .replace("display", "")
            .toLowerCase(),
        )
        setSortAsc(sortDirection === "asc")
      }}
      subHeader
      subHeaderAlign="center"
      subHeaderComponent={<Filter />}
      striped
      highlightOnHover
    />
  )
}
