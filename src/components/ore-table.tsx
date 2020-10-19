import React from "react"
import {
  Prices,
  useOreFilters,
  useBonusFilters,
  useCompressedFilters,
  useAvailabilityFilters,
} from "../hooks"
import useLocalStorageState from "use-local-storage-state"
import Loading from "./loading"
import DataTable from "react-data-table-component"
import { customStyles } from "./theme"
import Filter from "./filter"
import IskM3 from "./isk-m3"
import Bonus from "./bonus"
import Icon from "./icon"
import sortBy from "lodash.sortby"
import uniqBy from "lodash.uniqby"
import uniq from "lodash.uniq"

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
          href={`https://market.fuzzwork.co.uk/type/${row.id}/`}
          title={`${row.name} Orders`}
        >
          {row.name}
        </a>{" "}
        <Bonus bonus={row.bonus} />
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
        <a href={`https://everef.net/type/${row.id}`}>
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
  const [asteroidType, setAsteroidType] = useLocalStorageState(
    "asteroidType",
    "ore",
  )
  const [oreFilters] = useOreFilters()
  const [bonusFilters] = useBonusFilters()
  const [compressedFilters] = useCompressedFilters()
  const [availabilityFilters] = useAvailabilityFilters()
  const [sortField, setSortField] = useLocalStorageState(
    "sortField",
    "buy.perm3",
  )
  const [sortAsc, setSortAsc] = useLocalStorageState("sortAsc", false)

  if (error) return <div className="p-4">failed to load</div>
  if (!data) return <Loading />

  const filteredData = data.filter((ore) => ore.asteroidType === asteroidType)

  const filterGroups: OreGroup[] = sortBy(
    uniqBy(
      filteredData.map((ore) => ({
        name: ore.group,
        color: ore.color,
        baseOreId: ore.id,
      })),
      "name",
    ),
    (group: OreGroup) => group.name,
  )

  const filterBonuses: string[] = sortBy(
    uniq(filteredData.map((ore) => ore.bonus)),
    (bonus) => {
      const parsed = parseInt(bonus)
      if (isNaN(parsed)) {
        return bonus
      }

      return parsed
    },
  )

  const filterAvailability: string[] = sortBy(
    uniq(filteredData.flatMap((ore) => ore.availableIn)),
    (availability) => {
      if (availability.startsWith("R")) {
        return parseInt(availability.substring(1))
      }
      return availability
    },
  )

  return (
    <DataTable
      title={
        <>
          <a
            href="https://harvest.poisonreverse.net/"
            title="Eve Harvest"
            className="mr-3 sm:mr-8 md:mr-16"
          >
            Eve Harvest
          </a>
          <button
            className={`${
              asteroidType === "ore"
                ? "border-transparent bg-orange-200 text-orange-800"
                : "text-orange-400 border-gray-100"
            } text-sm px-3 sm:px-8 md:px-12 py-3 font-semibold leading-none border hover:border-transparent hover:bg-gray-100 hover:text-orange-800`}
            onClick={() => setAsteroidType("ore")}
          >
            Ore
          </button>
          <button
            className={`${
              asteroidType === "moon"
                ? "border-transparent bg-purple-200 text-purple-800"
                : "text-purple-300 border-gray-100"
            } text-sm px-3 sm:px-8 md:px-12 py-3 font-semibold leading-none border hover:border-transparent hover:bg-gray-100 hover:text-purple-800`}
            onClick={() => setAsteroidType("moon")}
          >
            Moon
          </button>
          <button
            className={`${
              asteroidType === "ice"
                ? "border-transparent bg-blue-100 text-blue-900"
                : "text-blue-200 border-gray-100"
            } text-sm px-3 sm:px-8 md:px-12 py-3 font-semibold leading-none border hover:border-transparent hover:bg-gray-100 hover:text-blue-900`}
            onClick={() => setAsteroidType("ice")}
          >
            Ice
          </button>
        </>
      }
      columns={columns}
      data={filteredData
        .filter((ore) => oreFilters[ore.group])
        .filter((ore) => bonusFilters[ore.bonus])
        .filter((ore) => compressedFilters[ore.compressed.toString()])
        .filter((ore) =>
          ore.availableIn.some((available) => availabilityFilters[available]),
        )}
      theme="custom"
      customStyles={customStyles}
      defaultSortField={sortField}
      defaultSortAsc={sortAsc}
      onSort={(column, sortDirection) => {
        setSortField(column.selector as string)
        setSortAsc(sortDirection === "asc")
      }}
      actions={<>{actions}</>}
      subHeader
      subHeaderAlign="center"
      subHeaderComponent={
        <Filter
          filterGroups={filterGroups}
          filterBonuses={filterBonuses}
          filterAvailability={filterAvailability}
        />
      }
      striped
      highlightOnHover
    />
  )
}
