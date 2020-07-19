import {
  columns,
  fetcher,
  getMineralsPrice,
  getOrePrice,
  mineralsList,
  ores,
  oresList,
} from "./data"
import React, { useMemo } from "react"
import useSWR from "swr"
import { useOreFilters } from "./hooks"
import useLocalStorageState from "use-local-storage-state"
import { Loading } from "./loading"
import DataTable from "react-data-table-component"
import { customStyles } from "./theme"
import { Filter } from "./filter"

function dataFactory(priceMap: Prices | undefined) {
  return (
    priceMap &&
    oresList
      .filter((ore) => ore.bonus < 0.15)
      .map((ore) => {
        const { id, name, bonus, primaryOreId, color } = ore
        const { name: group } = ores.get(primaryOreId)!
        const buy = getOrePrice(priceMap, ore, "buy")
        const mineralsBuy = getMineralsPrice(priceMap, ore, "buy")
        const sell = getOrePrice(priceMap, ore, "sell")
        const mineralsSell = getMineralsPrice(priceMap, ore, "sell")

        return {
          id,
          name,
          group,
          bonus,
          color,
          primaryOreId,
          buy,
          mineralsBuy: mineralsBuy * 0.7,
          perfectMineralsBuy: mineralsBuy * 0.8934,
          sell,
          mineralsSell: mineralsSell * 0.7,
          perfectMineralsSell: mineralsSell * 0.8934,
        }
      })
  )
}

const allItems = (oresList as Id[]).concat(mineralsList)
const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${allItems
  .map(({ id }) => id)
  .join(",")}`

export default function App() {
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
      data={data.filter((ore) => state[ore.primaryOreId])}
      theme="custom"
      customStyles={customStyles}
      defaultSortField={sortField}
      defaultSortAsc={sortAsc}
      onSort={(column, sortDirection) => {
        setSortField(column.selector as string)
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
