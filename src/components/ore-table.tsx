import React from "react"
import { Prices, useOreFilters } from "../hooks"
import useLocalStorageState from "use-local-storage-state"
import Loading from "./loading"
import DataTable from "react-data-table-component"
import { customStyles } from "./theme"
import Filter from "./filter"
import IskM3 from "./isk-m3"
import Bonus from "./bonus"
import Icon from "./icon"

const iskCell = (
  selector: "buy" | "sell",
  subSelector: BuySellPriceNumberKeys,
  titleSelector?: BuySellPriceNumberKeys,
) => (row: OrePrice) => (
  <div>
    <IskM3
      value={row[selector][subSelector]}
      titleValue={titleSelector && row[selector][titleSelector]}
    />
  </div>
)

const numericSort = (
  selector: "buy" | "sell",
  subSelector: BuySellPriceNumberKeys,
) => (a: OrePrice, b: OrePrice) =>
  a[selector][subSelector] - b[selector][subSelector]

const localeSort = (key: OrePriceStringKeys) => (a: OrePrice, b: OrePrice) =>
  a[key].localeCompare(b[key])

function priceColumns(selector: "buy" | "sell") {
  const capitalizedSelector =
    selector.charAt(0).toUpperCase() + selector.substring(1)

  return [
    {
      name: `${capitalizedSelector} Price`,
      selector: `${selector}.perm3`,
      sortable: true,
      sortFunction: numericSort(selector, "perm3"),
      wrap: true,
      cell: iskCell(selector, "perm3", "individual"),
    },
    {
      name: `Minerals ${capitalizedSelector} Price`,
      selector: `${selector}.minerals`,
      sortable: true,
      sortFunction: numericSort(selector, "minerals"),
      wrap: true,
      cell: iskCell(selector, "minerals"),
    },
    {
      name: `Perfect Minerals ${capitalizedSelector} Price`,
      selector: `${selector}.perfectMinerals`,
      sortable: true,
      sortFunction: numericSort(selector, "perfectMinerals"),
      wrap: true,
      cell: iskCell(selector, "perfectMinerals"),
    },
  ]
}

const columns = [
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
  ...priceColumns("buy"),
  ...priceColumns("sell"),
]

export default function OreTable({
  actions,
}: {
  actions: React.ComponentElement<any, any>
}) {
  const { data, error } = Prices.useContainer()
  const [oreFilters] = useOreFilters()
  const [sortField, setSortField] = useLocalStorageState(
    "sortField",
    "buy.perm3",
  )
  const [sortAsc, setSortAsc] = useLocalStorageState("sortAsc", false)

  if (error) return <div className="p-4">failed to load</div>
  if (!data) return <Loading />

  return (
    <DataTable
      title={
        <a href="https://harvest.poisonreverse.net/" title="Eve Harvest">
          Eve Harvest
        </a>
      }
      columns={columns}
      data={data.filter((ore) => oreFilters[ore.primaryOreId])}
      theme="custom"
      customStyles={customStyles}
      defaultSortField={sortField}
      defaultSortAsc={sortAsc}
      onSort={(column, sortDirection) => {
        setSortField(column.selector as string)
        setSortAsc(sortDirection === "asc")
      }}
      actions={actions}
      subHeader
      subHeaderAlign="center"
      subHeaderComponent={<Filter />}
      striped
      highlightOnHover
    />
  )
}
