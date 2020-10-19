type Ore = {
  id: number
  volume: number
  compressAmount: number
  refineAmount: number
  asteroidType: string
  bonus: string
  name: string
  groupName: string
  color: string
  compressesFrom?: number
  minerals: {
    [key: string]: number | undefined
  }
  availableIn: string[]
}

type OreGroup = {
  baseOreId: number
  color: string
  name: string
}

type Id = {
  id: number
}

type ItemPrice = {
  weightedAverage: string
  max: string
  min: string
  stddev: string
  median: string
  volume: string
  orderCount: string
  percentile: string
}

type Price = {
  buy: ItemPrice
  sell: ItemPrice
}

type Prices = {
  [key: string]: Price
}

type BuySellPrice = {
  perm3: number
  individual: number
  minerals: number
  perfectMinerals: number
}

type OrePrice = {
  id: number
  name: string
  group: string
  bonus: string
  color: string
  buy: BuySellPrice
  sell: BuySellPrice
}

type OrePriceStringKeys = {
  [K in keyof OrePrice]: OrePrice[K] extends string ? K : never
}[keyof OrePrice]

type BuySellPriceNumberKeys = {
  [K in keyof BuySellPrice]: BuySellPrice[K] extends number ? K : never
}[keyof BuySellPrice]
