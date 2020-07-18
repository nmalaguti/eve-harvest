import React from "react"
import ReactDOM from "react-dom"
import oresList from "./ores.json"
import mineralsList from "./minerals.json"
import useSWR from "swr"
import DataTable, { createTheme } from "react-data-table-component"

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
    [key: string]: number
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
    return +(
      priceMap[ore.id][buysell].percentile /
      ore.compressAmount /
      primary.volume
    ).toFixed(2)
  } else {
    return 0
  }
}

const getMineralsPrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
  refinePercent: number,
) => {
  const primary = ores.get(ore.primaryOreId)!
  return +(
    Object.entries(ore.minerals || {})
      .map(
        ([mineralId, amount]) =>
          (priceMap[mineralId][buysell].percentile * amount) /
          primary.refineAmount /
          primary.volume,
      )
      .reduce((a, b) => a + b, 0) * refinePercent
  ).toFixed(2)
}

const numericSort = (key) => (a, b) =>
  Number.parseFloat(a[key]) - Number.parseFloat(b[key])

const columns = [
  {
    name: "Ore Name",
    selector: "name",
    sortable: true,
    grow: 2,
    wrap: true,
  },
  {
    name: "",
    selector: "icon",
    sortable: false,
    width: "64px",
    wrap: true,
  },
  {
    name: "Bonus",
    selector: "bonus",
    sortable: true,
    sortFunction: numericSort("bonus"),
    wrap: true,
  },
  {
    name: "Buy Price",
    selector: "buy",
    sortable: true,
    sortFunction: numericSort("buy"),
    wrap: true,
  },
  {
    name: "Minerals Buy Price",
    selector: "mineralsBuy",
    sortable: true,
    sortFunction: numericSort("mineralsBuy"),
    wrap: true,
  },
  {
    name: "Perfect Minerals Buy Price",
    selector: "perfectMineralsBuy",
    sortable: true,
    sortFunction: numericSort("perfectMineralsBuy"),
    wrap: true,
  },
  {
    name: "Sell Price",
    selector: "sell",
    sortable: true,
    sortFunction: numericSort("sell"),
    wrap: true,
  },
  {
    name: "Minerals Sell Price",
    selector: "mineralsSell",
    sortable: true,
    sortFunction: numericSort("mineralsSell"),
    wrap: true,
  },
  {
    name: "Perfect Minerals Sell Price",
    selector: "perfectMineralsSell",
    sortable: true,
    sortFunction: numericSort("perfectMineralsSell"),
    wrap: true,
  },
]

function App() {
  const allItems = (oresList as Id[]).concat(mineralsList)
  const url = `https://market.fuzzwork.co.uk/aggregates/?region=10000002&types=${allItems
    .map((item) => item.id)
    .join(",")}`
  const { data: priceMap, error } = useSWR(url, fetcher, {
    refreshInterval: 600_000, // 10 mins
    focusThrottleInterval: 60_000, // 1 min
  })

  if (error) return <div>failed to load</div>
  if (!priceMap) return <div className="m-4 content-center">loading...</div>

  const data = oresList
    .filter((ore) => ore.bonus < 0.15)
    .map((ore) => {
      return {
        id: ore.id,
        name: ore.name,
        icon: (
          <img
            src={`https://images.evetech.net/types/${ore.id}/icon?size=32`}
            alt={ore.name}
            title={ore.name}
          />
        ),
        bonus: `${ore.bonus * 100}%`,
        buy: `${getOrePrice(priceMap, ore, "buy")} isk/m3`,
        mineralsBuy: `${getMineralsPrice(priceMap, ore, "buy", 0.7)} isk/m3`,
        perfectMineralsBuy: `${getMineralsPrice(
          priceMap,
          ore,
          "buy",
          0.8934,
        )} isk/m3`,
        sell: `${getOrePrice(priceMap, ore, "sell")} isk/m3`,
        mineralsSell: `${getMineralsPrice(priceMap, ore, "sell", 0.7)} isk/m3`,
        perfectMineralsSell: `${getMineralsPrice(
          priceMap,
          ore,
          "sell",
          0.8934,
        )} isk/m3`,
      }
    })

  return (
    <>
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
    </>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
