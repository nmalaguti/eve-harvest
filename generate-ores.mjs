import Database from "better-sqlite3"
import ora from "ora"
import bz2 from "unbzip2-stream"
import fs from "fs"
import https from "https"
import tmp from "tmp"

tmp.setGracefulCleanup()

const SQLITE_FILE = "tmp_sde.sqlite"
const ORE_FILE = "./src/json/ores.json"

const GROUPS = new Map([
  [
    450,
    {
      name: "Arkonor",
      color: "#c9aaae",
      available: ["nullsec"],
    },
  ],
  [
    451,
    {
      name: "Bistot",
      color: "#5bda74",
      available: ["nullsec"],
    },
  ],
  [
    452,
    {
      name: "Crokite",
      color: "#fada6b",
      available: ["lowsec", "nullsec"],
    },
  ],
  [
    453,
    {
      name: "Dark Ochre",
      color: "#f7efc6",
      available: ["lowsec"],
    },
  ],
  [
    454,
    {
      name: "Hedbergite",
      color: "#86d4e2",
      available: ["lowsec"],
    },
  ],
  [
    455,
    {
      name: "Hemorphite",
      color: "#a4c6dd",
      available: ["lowsec"],
    },
  ],
  [
    456,
    {
      name: "Jaspet",
      color: "#9cc09c",
      available: ["lowsec"],
    },
  ],
  [
    457,
    {
      name: "Kernite",
      color: "#94dbd6",
      available: ["lowsec", "nullsec"],
    },
  ],
  [
    458,
    {
      name: "Plagioclase",
      color: "#c5ebc5",
      available: ["highsec"],
    },
  ],
  [
    459,
    {
      name: "Pyroxeres",
      color: "#f7efcb",
      available: ["highsec", "lowsec", "nullsec"],
    },
  ],
  [
    460,
    {
      name: "Scordite",
      color: "#c1c9bc",
      available: ["highsec"],
    },
  ],
  [
    461,
    {
      name: "Spodumain",
      color: "#ced77c",
      available: ["lowsec"],
    },
  ],
  [
    462,
    {
      name: "Veldspar",
      color: "#d3b871",
      available: ["highsec"],
    },
  ],
  [
    467,
    {
      name: "Gneiss",
      color: "#8cfb9d",
      available: ["lowsec"],
    },
  ],
  [
    468,
    {
      name: "Mercoxit",
      color: "#de8d63",
      available: ["nullsec"],
    },
  ],
  [
    469,
    {
      name: "Omber",
      color: "#fffb9d",
      available: ["lowsec", "nullsec"],
    },
  ],
  [
    4029,
    {
      name: "Talassonite",
      color: "#c38553",
      available: ["triglavian"],
    },
  ],
  [
    4030,
    {
      name: "Rakovene",
      color: "#7da4a8",
      available: ["triglavian"],
    },
  ],
  [
    4031,
    {
      name: "Bezdnacine",
      color: "#c3bca8",
      available: ["triglavian"],
    },
  ],
])

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

  const ores = Array.from(GROUPS.keys()).flatMap((id) => getOresStmt.all(id))

  ores.forEach((ore) => {
    ore.color = GROUPS.get(ore.groupId).color
    ore.groupName = oreGroupStmt.get(ore.groupId)
    const oreType = oreTypeStmt.get(ore.id)
    switch (oreType) {
      case 1:
        ore.bonus = 0
        break
      case 2:
        ore.bonus = 0.05
        break
      case 3:
        ore.bonus = 0.1
        break
      case 4:
        ore.bonus = 0.15
        break
    }

    // Hardcoding some fixes for Triglavian Ores
    // TODO: remove this hack once the SDE is correct
    if (ore.name.startsWith("Abyssal ") && ore.bonus === 0) {
      ore.bonus = 0.05
    } else if (ore.name.startsWith("Hadal ") && ore.bonus === 0) {
      ore.bonus = 0.1
    }

    ore.minerals = materialsStmt.all(ore.id).reduce((obj, row) => {
      obj[row.materialTypeID] = row.quantity
      return obj
    }, {})

    ore.availableIn = GROUPS.get(ore.groupId).available

    const compressesFrom = (ore.compressesFrom = compressesFromStmt.get(ore.id))
    ore.compressAmount =
      (compressesFrom && getCompressionStmt.get(compressesFrom)) || 1
  })

  fs.writeFileSync(
    ORE_FILE,
    JSON.stringify(
      ores.filter((ore) => ore.bonus < 0.15),
      null,
      2,
    ),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
