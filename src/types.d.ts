type Ore = {
  id: number
  volume: number
  compressAmount: number
  refineAmount: number
  bonus: number
  name: string
  primaryOreId: number
  color: string
  minerals: {
    [key: string]: number | undefined
  }
}

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
