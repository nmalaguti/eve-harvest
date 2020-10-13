import uniq from "lodash.uniq"
import uniqBy from "lodash.uniqby"
import sortBy from "lodash.sortby"
import oresList from "./json/ores.json"

const ores: Map<number, Ore> = new Map(oresList.map((ore) => [ore.id, ore]))

export const oreGroups: OreGroup[] = sortBy(
  uniqBy(
    oresList
      .filter((ore) => !ore.compressesFrom)
      .map((ore) => ({
        id: ore.groupId,
        name: ore.groupName,
        color: ore.color,
        baseOreId: ore.id,
      })),
    "id",
  ),
  (group: OreGroup) => group.name,
)

export const oreBonuses: number[] = sortBy(
  uniq(oresList.map((ore) => ore.bonus)),
)

const getOrePrice = (
  priceMap: Prices,
  ore: Ore,
  buysell: "buy" | "sell",
): number => {
  const uncompressedOre = ores.get(ore.compressesFrom || ore.id)!
  if (+priceMap[ore.id][buysell].percentile > 0) {
    return (
      +priceMap[ore.id][buysell].percentile /
      ore.compressAmount /
      uncompressedOre.volume
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
  const uncompressedOre = ores.get(ore.compressesFrom || ore.id)!
  return Object.entries(ore.minerals || {})
    .map(
      ([mineralId, amount]) =>
        (+priceMap[mineralId][buysell].percentile * amount!) /
        uncompressedOre.refineAmount /
        uncompressedOre.volume,
    )
    .reduce((a, b) => a + b, 0)
}

export function dataFactory(priceMap?: Prices) {
  return (
    priceMap &&
    oresList
      .filter((ore) => ore.bonus < 0.15)
      .map((ore) => {
        const {
          id,
          name,
          bonus,
          groupId,
          groupName: group,
          color,
          compressAmount,
          availableIn,
        } = ore
        const buy = getOrePrice(priceMap, ore, "buy")
        const mineralsBuy = getMineralsPrice(priceMap, ore, "buy")
        const sell = getOrePrice(priceMap, ore, "sell")
        const mineralsSell = getMineralsPrice(priceMap, ore, "sell")

        return {
          id,
          name,
          group,
          groupId,
          bonus,
          color,
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
          availableIn,
        }
      })
  )
}
