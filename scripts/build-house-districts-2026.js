// Generator for public/geo/us-house-districts-2026-albers.json: the congressional districts
// that elected the House on November 3, 2026, pre-projected into the same 975×610 Albers USA
// space as us-states-albers-10m.json so they overlay the national state map.
//
// Source: Census TIGERweb Legislative service, "120th Congressional Districts" (the districts
// for the Congress elected in 2026, from TIGER 2026). Nine states drew new maps after the 2024
// election and are in that layer: AL, CA, FL, LA, NC, OH, TN, TX, UT.
//
// Exception: Missouri. TIGER 2026 carries the map Missouri enacted in September 2025, but a
// citizen referendum suspended it, and on September 25, 2026 the U.S. Supreme Court stayed the
// order that would have forced its use, so Missouri voted on its 2022 districts. Missouri is
// taken from the "119th Congressional Districts" layer instead.
//
// Each district is clipped to its state's outline from us-states-albers-10m.json, which is
// shoreline-clipped (TIGER districts run out into the Great Lakes and coastal water) and is the
// shape the state map draws, so district edges meet state borders exactly. At-large states use
// the state outline as their single district.
//
// Run with: node scripts/build-house-districts-2026.js
const fs = require("fs")
const path = require("path")
const { geoAlbersUsa } = require("d3-geo")
const polygonClipping = require("polygon-clipping")
const topojsonClient = require("topojson-client")
const topojsonServer = require("topojson-server")

const ROOT = path.join(__dirname, "..")
const CACHE = path.join(ROOT, "scripts", ".cache", "house-districts-2026")
const OUT = path.join(ROOT, "public", "geo", "us-house-districts-2026-albers.json")
const SERVICE = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer"
const CD120_LAYER = 0
const CD119_LAYER = 4
/** States whose 2026 election used a map other than TIGER's 120th Congress districts */
const LAYER_OVERRIDE = { "29": CD119_LAYER }
/** Generalization in degrees (~400 m); a pixel of the national map is ~5 km */
const MAX_OFFSET = 0.004

/** Seats per state after the 2020 apportionment, to check the download */
const SEATS = {
  "01": 7, "02": 1, "04": 9, "05": 4, "06": 52, "08": 8, "09": 5, "10": 1, "12": 28, "13": 14,
  "15": 2, "16": 2, "17": 17, "18": 9, "19": 4, "20": 4, "21": 6, "22": 6, "23": 2, "24": 8,
  "25": 9, "26": 13, "27": 8, "28": 4, "29": 8, "30": 2, "31": 3, "32": 4, "33": 2, "34": 12,
  "35": 3, "36": 26, "37": 14, "38": 1, "39": 15, "40": 5, "41": 6, "42": 17, "44": 2, "45": 7,
  "46": 1, "47": 9, "48": 38, "49": 4, "50": 1, "51": 11, "53": 10, "54": 2, "55": 8, "56": 1,
}

const projection = geoAlbersUsa().scale(1300).translate([487.5, 305])

async function download(fips, layer) {
  const file = path.join(CACHE, `${fips}-layer${layer}.geojson`)
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"))
  const query = new URLSearchParams({
    where: `STATE='${fips}'`,
    outFields: "GEOID,NAME,CDTYP",
    outSR: "4326",
    maxAllowableOffset: String(MAX_OFFSET),
    geometryPrecision: "5",
    f: "geojson",
  })
  const res = await fetch(`${SERVICE}/${layer}/query?${query}`)
  if (!res.ok) throw new Error(`TIGERweb ${fips} layer ${layer}: ${res.status}`)
  const json = await res.json()
  if (!json.features) throw new Error(`TIGERweb ${fips} layer ${layer}: ${JSON.stringify(json).slice(0, 200)}`)
  fs.mkdirSync(CACHE, { recursive: true })
  fs.writeFileSync(file, JSON.stringify(json))
  return json
}

/** Projected polygon-clipping MultiPolygon, dropping points Albers USA can't place */
function project(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
  return polygons
    .map((rings) =>
      rings
        .map((ring) => ring.map((p) => projection(p)).filter(Boolean))
        .filter((ring) => ring.length >= 4)
    )
    .filter((rings) => rings.length)
}

function toGeometry(multi) {
  return multi.length === 1
    ? { type: "Polygon", coordinates: multi[0] }
    : { type: "MultiPolygon", coordinates: multi }
}

function asMulti(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

async function main() {
  const statesTopo = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "geo", "us-states-albers-10m.json"), "utf8"))
  const states = Object.fromEntries(
    topojsonClient.feature(statesTopo, statesTopo.objects.states).features.map((f) => [f.id, f])
  )

  const features = []
  for (const [fips, seats] of Object.entries(SEATS)) {
    const state = states[fips]
    if (!state) throw new Error(`no state outline for ${fips}`)
    const stateName = state.properties.name
    if (seats === 1) {
      features.push({
        type: "Feature",
        id: `${fips}00`,
        properties: { name: `${stateName} at-large` },
        geometry: state.geometry,
      })
      continue
    }
    const layer = LAYER_OVERRIDE[fips] ?? CD120_LAYER
    const json = await download(fips, layer)
    const districts = json.features.filter((f) => !f.properties.GEOID.endsWith("ZZ"))
    if (districts.length !== seats) {
      throw new Error(`${stateName}: ${districts.length} districts, expected ${seats}`)
    }
    const outline = asMulti(state.geometry)
    let area = 0
    for (const d of districts) {
      const clipped = polygonClipping.intersection(project(d.geometry), outline)
      if (!clipped.length) throw new Error(`${d.properties.GEOID} lies outside ${stateName}`)
      area += planarArea(clipped)
      const n = Number(d.properties.GEOID.slice(2))
      features.push({
        type: "Feature",
        id: d.properties.GEOID,
        properties: { name: `${stateName}'s ${ordinal(n)}` },
        geometry: toGeometry(clipped),
      })
    }
    // The clipped districts should tile the state; a large shortfall means missing geometry
    const coverage = area / planarArea(outline)
    if (coverage < 0.98 || coverage > 1.02) {
      throw new Error(`${stateName}: districts cover ${(coverage * 100).toFixed(1)}% of the state`)
    }
    console.log(`  ${stateName}: ${districts.length} districts (layer ${layer}), ${(coverage * 100).toFixed(2)}% coverage`)
  }

  const total = features.length
  if (total !== 435) throw new Error(`${total} districts, expected 435`)
  const topology = topojsonServer.topology(
    { districts: { type: "FeatureCollection", features } },
    1e5
  )
  fs.writeFileSync(OUT, JSON.stringify(topology))
  console.log(`${total} districts, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB -> ${path.relative(ROOT, OUT)}`)
}

function planarArea(multi) {
  let sum = 0
  for (const rings of multi) {
    rings.forEach((ring, i) => {
      let a = 0
      for (let j = 0, k = ring.length - 1; j < ring.length; k = j++) {
        a += (ring[k][0] + ring[j][0]) * (ring[k][1] - ring[j][1])
      }
      sum += (i === 0 ? 1 : -1) * Math.abs(a / 2)
    })
  }
  return sum
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
