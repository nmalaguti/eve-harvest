import Database from "better-sqlite3"
import ora from "ora"
import bz2 from "unbzip2-stream"
import fs from "fs"
import https from "https"
import tmp from "tmp"

tmp.setGracefulCleanup()

const SQLITE_FILE = tmp.tmpNameSync()
const ORE_FILE = "./src/json/ores.json"

const COLORS = new Map([
  // ORES
  ["Arkonor", "#c9aaae"],
  ["Bistot", "#5bda74"],
  ["Crokite", "#fada6b"],
  ["Dark Ochre", "#f7efc6"],
  ["Hedbergite", "#86d4e2"],
  ["Hemorphite", "#a4c6dd"],
  ["Jaspet", "#9cc09c"],
  ["Kernite", "#94dbd6"],
  ["Plagioclase", "#c5ebc5"],
  ["Pyroxeres", "#f7efcb"],
  ["Scordite", "#c1c9bc"],
  ["Spodumain", "#ced77c"],
  ["Veldspar", "#d3b871"],
  ["Gneiss", "#8cfb9d"],
  ["Mercoxit", "#de8d63"],
  ["Omber", "#fffb9d"],
  ["Talassonite", "#c38553"],
  ["Rakovene", "#7da4a8"],
  ["Bezdnacine", "#c3bca8"],

  // MOON
  ["Bitumens", "#beaa86"],
  ["Carnotite", "#4a6795"],
  ["Chromite", "#9a6442"],
  ["Cinnabar", "#56637f"],
  ["Cobaltite", "#688f95"],
  ["Coesite", "#b79f79"],
  ["Euxenite", "#5e7679"],
  ["Loparite", "#c1847f"],
  ["Monazite", "#b88c86"],
  ["Otavite", "#c69e7c"],
  ["Pollucite", "#375284"],
  ["Scheelite", "#54757d"],
  ["Sperrylite", "#ac8366"],
  ["Sylvite", "#ac9e81"],
  ["Titanite", "#606f6f"],
  ["Vanadinite", "#957e6b"],
  ["Xenotime", "#987874"],
  ["Ytterbite", "#835c57"],
  ["Zeolites", "#b1a28a"],
  ["Zircon", "#535d6c"],

  // ICE
  ["Krystallos", "#7893a4"],
  ["Dark Glitter", "#a7b4bb"],
  ["Gelidus", "#8cbabd"],
  ["Glare Crust", "#92a8b3"],
  ["Clear Icicle", "#a8b2b8"],
  ["Blue Ice", "#91b5c8"],
  ["White Glaze", "#92a9b5"],
  ["Glacial Mass", "#b9cfdc"],
])

const AVAILABILITY = new Map([
  // ORES
  ["Arkonor", ["Nullsec"]],
  ["Bistot", ["Nullsec"]],
  ["Crokite", ["Lowsec", "Nullsec"]],
  ["Dark Ochre", ["Lowsec"]],
  ["Hedbergite", ["Lowsec"]],
  ["Hemorphite", ["Lowsec"]],
  ["Jaspet", ["Lowsec"]],
  ["Kernite", ["Lowsec", "Nullsec"]],
  ["Plagioclase", ["Highsec"]],
  ["Pyroxeres", ["Highsec", "Lowsec", "Nullsec"]],
  ["Scordite", ["Highsec"]],
  ["Spodumain", ["Lowsec", "Triglavian"]],
  ["Veldspar", ["Highsec"]],
  ["Gneiss", ["Lowsec"]],
  ["Mercoxit", ["Nullsec"]],
  ["Omber", ["Lowsec", "Nullsec"]],
  ["Talassonite", ["Triglavian"]],
  ["Rakovene", ["Triglavian"]],
  ["Bezdnacine", ["Triglavian"]],

  // MOON
  ["Bitumens", ["R4"]],
  ["Carnotite", ["R32"]],
  ["Chromite", ["R16"]],
  ["Cinnabar", ["R32"]],
  ["Cobaltite", ["R8"]],
  ["Coesite", ["R4"]],
  ["Euxenite", ["R8"]],
  ["Loparite", ["R64"]],
  ["Monazite", ["R64"]],
  ["Otavite", ["R16"]],
  ["Pollucite", ["R32"]],
  ["Scheelite", ["R8"]],
  ["Sperrylite", ["R16"]],
  ["Sylvite", ["R4"]],
  ["Titanite", ["R8"]],
  ["Vanadinite", ["R16"]],
  ["Xenotime", ["R64"]],
  ["Ytterbite", ["R64"]],
  ["Zeolites", ["R4"]],
  ["Zircon", ["R32"]],

  // ICE
  ["Krystallos", ["Nullsec"]],
  ["Dark Glitter", ["Nullsec", "Lowsec"]],
  ["Gelidus", ["Nullsec"]],
  ["Enriched Clear Icicle", ["Nullsec", "Amarr"]],
  ["Thick Blue Ice", ["Nullsec", "Gallente"]],
  ["Pristine White Glaze", ["Nullsec", "Caldar"]],
  ["Smooth Glacial Mass", ["Nullsec", "Minmatar"]],
  ["Glare Crust", ["Nullsec", "Lowsec"]],
  ["Clear Icicle", ["Amarr"]],
  ["Blue Ice", ["Gallente"]],
  ["White Glaze", ["Caldari"]],
  ["Glacial Mass", ["Minmatar"]],
])

const ORE_GROUPS = new Map([
  [450, "Arkonor"],
  [451, "Bistot"],
  [452, "Crokite"],
  [453, "Dark Ochre"],
  [454, "Hedbergite"],
  [455, "Hemorphite"],
  [456, "Jaspet"],
  [457, "Kernite"],
  [458, "Plagioclase"],
  [459, "Pyroxeres"],
  [460, "Scordite"],
  [461, "Spodumain"],
  [462, "Veldspar"],
  [467, "Gneiss"],
  [468, "Mercoxit"],
  [469, "Omber"],
  [4029, "Talassonite"],
  [4030, "Rakovene"],
  [4031, "Bezdnacine"],
])

const MOON_GROUPS = new Map([
  [1884, "Ubiquitous Moon Asteroids"],
  [1920, "Common Moon Asteroids"],
  [1921, "Uncommon Moon Asteroids"],
  [1922, "Rare Moon Asteroids"],
  [1923, "Exceptional Moon Asteroids"],
])

const ICE_GROUPS = new Map([[465, "Ice"]])

function downloadLatestDatabase() {
  return new Promise((resolve, reject) => {
    const spinner = ora("Downloading latest SDE").start()
    https.get(
      "https://www.fuzzwork.co.uk/dump/sqlite-latest.sqlite.bz2",
      {
        headers: {
          "User-Agent": "https://github.com/nmalaguti/eve-harvest",
        },
      },
      (res) => {
        res
          .pipe(bz2())
          .pipe(fs.createWriteStream(SQLITE_FILE))
          .on("close", () => {
            spinner.succeed()
            resolve()
          })
          .on("error", (err) => {
            spinner.fail()
            reject(err)
          })
      },
    )
  })
}

async function main() {
  if (!fs.existsSync(SQLITE_FILE)) {
    await downloadLatestDatabase()
  }

  const db = new Database(SQLITE_FILE)

  const getOresStmt = db.prepare(
    `SELECT typeID AS id, groupID as groupId, typeName AS name, volume, portionSize AS refineAmount
            FROM invTypes
            WHERE groupID = ? AND marketGroupID IS NOT NULL`,
  )

  const compressesFromStmt = db
    .prepare(
      `SELECT typeID FROM dgmTypeAttributes WHERE attributeID = 1940 AND valueFloat = ?`,
    )
    .pluck()

  const getCompressionStmt = db
    .prepare(
      `SELECT valueFloat
     FROM dgmTypeAttributes
     WHERE attributeID = 1941
     AND typeID = ?`,
    )
    .pluck()

  const oreGroupStmt = db
    .prepare(
      `SELECT groupName
     FROM invGroups
     WHERE groupID = ?`,
    )
    .pluck()

  const oreBasicTypeStmt = db
    .prepare(
      `SELECT valueFloat
     FROM dgmTypeAttributes
     WHERE attributeID = 2711
     AND typeID = ?`,
    )
    .pluck()

  const oreTypeStmt = db
    .prepare(
      `SELECT valueFloat
     FROM dgmTypeAttributes
     WHERE attributeID = 2699
     AND typeID = ?`,
    )
    .pluck()

  const materialsStmt = db.prepare(
    `SELECT m.typeID, materialTypeID, t.typeName, quantity
    FROM invTypeMaterials m JOIN invTypes t ON m.materialTypeID = t.typeID
    WHERE m.typeID = ?`,
  )

  const generateData = (groups, asteroidType, oreBonusMapper) => {
    const ores = Array.from(groups.keys()).flatMap((id) => getOresStmt.all(id))

    const oreNameLookup = new Map()
    ores.forEach((ore) => oreNameLookup.set(ore.id, ore.name))

    ores.forEach((ore) => {
      ore.asteroidType = asteroidType
      ore.groupName =
        oreNameLookup.get(oreBasicTypeStmt.get(ore.id)) ||
        oreGroupStmt.get(ore.groupId)
      ore.color = COLORS.get(ore.groupName)

      ore.bonus = oreBonusMapper(ore)

      ore.minerals = materialsStmt.all(ore.id).reduce((obj, row) => {
        obj[row.materialTypeID] = row.quantity
        return obj
      }, {})

      ore.availableIn = AVAILABILITY.get(ore.groupName)

      const compressesFrom = (ore.compressesFrom = compressesFromStmt.get(
        ore.id,
      ))
      ore.compressAmount =
        (compressesFrom && getCompressionStmt.get(compressesFrom)) || 1
    })

    return ores
  }

  const ores = generateData(ORE_GROUPS, "ore", (ore) => {
    let bonus

    const oreType = oreTypeStmt.get(ore.id)
    switch (oreType) {
      case 1:
        bonus = "0%"
        break
      case 2:
        bonus = "5%"
        break
      case 3:
        bonus = "10%"
        break
      case 4:
        bonus = "15%"
        break
    }

    // Hardcoding some fixes for Triglavian Ores
    // TODO: remove this hack once the SDE is correct
    if (ore.name.startsWith("Abyssal ") && bonus === "0%") {
      bonus = "5%"
    } else if (ore.name.startsWith("Hadal ") && bonus === "0%") {
      bonus = "10%"
    }

    return bonus
  }).filter((ore) => ore.bonus !== "15%") // exclude 15% ores since they no longer spawn

  const moon = generateData(MOON_GROUPS, "moon", (ore) => {
    let bonus

    const oreType = oreTypeStmt.get(ore.id)
    switch (oreType) {
      case 1:
        bonus = "0%"
        break
      case 3:
        bonus = "15%"
        break
      case 5:
        bonus = "100%"
        break
    }

    return bonus
  })

  const ices = generateData(ICE_GROUPS, "ice", (ore) => {
    let bonus

    const oreType = oreTypeStmt.get(ore.id)
    switch (oreType) {
      case 1:
        bonus = "0%"
        break
      case 4:
        bonus = "Enriched"
        break
    }

    return bonus
  })

  fs.writeFileSync(
    ORE_FILE,
    JSON.stringify([...ores, ...moon, ...ices], null, 2),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
