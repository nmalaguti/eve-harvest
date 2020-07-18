import React from "react"
import ReactDOM from "react-dom"
import oresList from "./ores.json"
import mineralsList from "./minerals.json"
import useSWR from "swr"
import DataTable, { createTheme } from "react-data-table-component"
// @ts-ignore
import rippleSpinner from "./ripple-spinner.svg"

createTheme("custom", {
  text: {
    primary: "#F7FAFC",
  },
  background: {
    default: "#1A202C",
  },
  divider: {
    default: "#E2E8F0",
  },
  sortFocus: {
    default: "#CBD5E0",
  },
  highlightOnHover: {
    default: "#DD6B20",
    text: "#F7FAFC",
  },
  striped: {
    default: "#2D3748",
    text: "#F7FAFC",
  },
})

const customStyles = {
  headCells: {
    style: {
      fontSize: "1rem",
      fontWeight: 700,
    },
  },
  rows: {
    style: {
      fontSize: "1rem",
    },
    highlightOnHoverStyle: {
      transitionDuration: "0s",
      borderBottomColor: "#E2E8F0",
      outlineColor: "#E2E8F0",
    },
  },
}

type Ore = {
  id: number
  volume: number
  compressAmount: number
  refineAmount: number
  bonus: number
  name: string
  primaryOreId: number
  minerals: {
    [key: string]: number | undefined
  }
}

const ores: Map<number, Ore> = new Map(oresList.map((ore) => [ore.id, ore]))

type Id = {
  id: number
}

type ItemPrice = {
  weightedAverage: number
  max: number
  min: number
  stddev: number
  median: number
  volume: number
  orderCount: number
  percentile: number
}

type Price = {
  buy: ItemPrice
  sell: ItemPrice
}

type Prices = {
  [key: string]: Price
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getOrePrice = (priceMap: Prices, ore: Ore, buysell: "buy" | "sell") => {
  const primary = ores.get(ore.primaryOreId)!
  if (priceMap[ore.id][buysell].percentile > 0) {
    return (
      priceMap[ore.id][buysell].percentile /
      ore.compressAmount /
      primary.volume
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } else {
    return "0.00"
  }
}

const getMineralsPrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
  refinePercent: number,
) => {
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
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const numericSort = (key: string) => (a: any, b: any) =>
  Number.parseFloat(a[key]) - Number.parseFloat(b[key])

const localeSort = (key: string) => (a: any, b: any) =>
  a[key].localeCompare(b[key])

const columns = [
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
    selector: "icon",
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

const IskM3 = ({ value }: { value: number | string }) => (
  <>
    {value}{" "}
    <span className="leading-5 text-xs">
      ISK/m<sup>3</sup>
    </span>
  </>
)

const Bonus = ({ amount }: { amount: number }) => (
  <>
    {amount > 0 ? (
      <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-300 text-green-900">
        +{amount * 100}%
      </span>
    ) : null}
  </>
)

const Icon = ({ id, name }: { id: number; name: string }) => (
  <img
    src={`https://images.evetech.net/types/${id}/icon?size=32`}
    alt={name}
    title={name}
  />
)

function App() {
  const allItems = (oresList as Id[]).concat(mineralsList)
  const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${allItems
    .map((item) => item.id)
    .join(",")}`
  const { data: priceMap, error } = useSWR(url, fetcher, {
    refreshInterval: 600_000, // 10 mins
    focusThrottleInterval: 60_000, // 1 min
  })

  if (error) return <div className="p-4">failed to load</div>
  if (!priceMap)
    return (
      <div className="p-4">
        <img
          src={rippleSpinner}
          alt="loading"
          title="loading"
          className="w-20 inline-flex"
        />
        loading...
      </div>
    )

  const data = oresList
    .filter((ore) => ore.bonus < 0.15)
    .map((ore) => {
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
        icon: <Icon id={id} name={name} />,
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
      }
    })

  return (
    <DataTable
      title="Eve Harvest"
      columns={columns}
      data={data}
      theme="custom"
      customStyles={customStyles}
      defaultSortField="buy"
      defaultSortAsc={false}
      striped
      highlightOnHover
    />
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
