import uniq from "lodash.uniq"
import sortBy from "lodash.sortby"
import oresList from "./json/ores.json"

const ores: Map<number, Ore> = new Map(oresList.map((ore) => [ore.id, ore]))

export const primaryOres: Ore[] = sortBy(
  uniq(oresList.map((ore) => ore.primaryOreId)).map((id) => ores.get(id)!),
  (ore: Ore) => ore.name,
)

export const oreBonuses: number[] = sortBy(
  uniq(oresList.map((ore) => ore.bonus)),
)

const getOrePrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
): number => {
  const primary = ores.get(ore.primaryOreId)!
  if (+priceMap[ore.id][buysell].percentile > 0) {
    return (
      +priceMap[ore.id][buysell].percentile /
      ore.compressAmount /
      primary.volume
    )
  } else {
    return 0
  }
}

const getMineralsPrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
): number => {
  const primary = ores.get(ore.primaryOreId)!
  return Object.entries(ore.minerals || {})
    .map(
      ([mineralId, amount]) =>
        (+priceMap[mineralId][buysell].percentile * amount!) /
        primary.refineAmount /
        primary.volume,
    )
    .reduce((a, b) => a + b, 0)
}

export function dataFactory(priceMap?: Prices) {
  return (
    priceMap &&
    oresList
      .filter((ore) => ore.bonus < 0.15)
      .map((ore) => {
        const { id, name, bonus, primaryOreId, color, compressAmount } = ore
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
          buy: {
            perm3: buy,
            individual: +priceMap[ore.id]["buy"].percentile,
            minerals: mineralsBuy * 0.7,
            perfectMinerals: mineralsBuy * 0.8934,
          },
          sell: {
            perm3: sell,
            individual: +priceMap[ore.id]["sell"].percentile,
            minerals: mineralsSell * 0.7,
            perfectMinerals: mineralsSell * 0.8934,
          },
          compressed: compressAmount === 100,
        }
      })
  )
}
