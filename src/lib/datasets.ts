/**
 * Every dataset the site shows: where it comes from, which vintage, which script builds it,
 * what that script does to it, and what to keep in mind when reading it. The methodology page
 * renders this list, and source notes and map captions read from it, so a source is described
 * in one place. Details follow each script's docstring in `scripts/`.
 */

export type Dataset = {
  id: DatasetId
  name: string
  /** Publisher and product, as cited */
  source: string
  url: string
  vintage: string
  /** Generator in scripts/, or null for figures entered by hand */
  script: string | null
  /** Files the script writes (paths under the repo) */
  outputs: string[]
  /** Short line under a map or chart */
  caption: string
  transformations: string[]
  caveats: string[]
  /** When the outputs were last regenerated (ISO date) */
  updated: string
}

export type DatasetId =
  | "state-demographics"
  | "county-history"
  | "county-election-2024"
  | "county-religion"
  | "cost-of-living"
  | "county-visas"
  | "school-visas"
  | "field-citizenship"
  | "generation-population"
  | "state-religion"
  | "state-election"
  | "midterms-2026"
  | "immigration-sentiment"
  | "enforcement"
  | "family-formation"
  | "work-visa-issuance"

export const DATASETS: Dataset[] = [
  {
    id: "state-demographics",
    name: "Population by ethnic group, by state and county",
    source: "U.S. Census Bureau: decennial census, ACS, and Vintage 2025 population estimates",
    url: "https://www.census.gov/programs-surveys/popest.html",
    vintage: "1960–2025",
    script: "scripts/build-states-data.py",
    outputs: [
      "src/data/states.json",
      "src/data/counties/<abbr>.json",
      "src/data/county-labels.json",
    ],
    caption: "Source: U.S. Census Bureau (Vintage 2025 estimates, ACS 2024)",
    transformations: [
      "European is non-Hispanic White minus Arab ancestry; Hispanic is of any race and every other group is non-Hispanic.",
      "Groups under 3% today are folded into Other on state charts; the tables list every group.",
    ],
    caveats: [
      "Ancestry-based groups (Arab, Indian, East Asian) are not available for every year.",
      "Values are rounded to one decimal.",
    ],
    updated: "2026-09-30",
  },
  {
    id: "county-history",
    name: "County population by group over time",
    source:
      "U.S. Census Bureau: 1990 county estimates (CO-99-10); 2000 and 2010 censuses; ACS 2016–2020; Vintage 2025 estimates with ACS 2020–2024",
    url: "https://www.census.gov/programs-surveys/popest.html",
    vintage: "1990, 2000, 2010, 2020, 2025",
    script: "scripts/build-county-history.py",
    outputs: ["public/data/county-history.json"],
    caption: "Source: U.S. Census Bureau",
    transformations: [
      "Counties are matched to today's map by FIPS; renamed counties are re-keyed and Chugach + Copper River are merged back into Valdez-Cordova.",
      "Connecticut's 2025 figures are keyed by its nine planning regions, which the map swaps in.",
    ],
    caveats: [
      "1990 has no county Asian-group or ancestry data: Indian, East Asian, and Arab are missing and European is all non-Hispanic White that year.",
      "Counties created or redrawn since a year (Broomfield CO, several Alaska boroughs) have no value for it.",
    ],
    updated: "2026-09-30",
  },
  {
    id: "county-election-2024",
    name: "2024 presidential election by county",
    source: "County results compiled from state and county election offices (tonmcg)",
    url: "https://github.com/tonmcg/US_County_Level_Election_Results_08-24",
    vintage: "November 2024 general election",
    script: "scripts/build-county-election-2024.py",
    outputs: ["public/data/county-election-2024.json"],
    caption: "Source: county results compiled from state and county election offices (tonmcg)",
    transformations: [
      "Shares are of all votes cast for president; third parties are the remainder.",
      "DC's wards are summed; Connecticut is reported by planning region.",
    ],
    caveats: [
      "Alaska reports by state house district, so every borough gets the certified statewide result.",
    ],
    updated: "2026-09-30",
  },
  {
    id: "county-religion",
    name: "Religious adherents by county",
    source: "U.S. Religion Census (ASARB) 2000–2020; Glenmary Research Center 1990; via the ARDA",
    url: "https://www.usreligioncensus.org/",
    vintage: "1990, 2000, 2010, 2020",
    script: "scripts/build-county-religion.py",
    outputs: ["public/data/county-religion.json"],
    caption: "Source: U.S. Religion Census (ASARB)",
    transformations: [
      "Each reporting group is sorted into a tradition following the ASARB/Pew families; non-denominational churches count as Evangelical Protestant.",
      "Unclaimed is the population not counted as an adherent of any participating group.",
    ],
    caveats: [
      "Historically Black denominations are absent from 2000 and incomplete in other years; Muslims are first estimated in 2000.",
      "Adherents are counted where their congregation meets, so a county can exceed 100%.",
    ],
    updated: "2026-09-30",
  },
  {
    id: "cost-of-living",
    name: "Cost of living",
    source:
      "BEA Regional Price Parities by state (2024); ACS 2020–2024 5-year B19013, B25077, B25064",
    url: "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area",
    vintage: "2024 (RPP); 2020–2024 (ACS 5-year)",
    script: "scripts/build-cost-of-living.py",
    outputs: [
      "src/data/state-cost.json",
      "src/data/county-cost.json",
      "public/data/county-cost.json",
    ],
    caption: "Source: U.S. Census Bureau, ACS 2020–2024 5-year estimates (B19013, B25077, B25064)",
    transformations: [
      "States use the 5-year ACS too, so every level is comparable.",
      "Home price to income is median home value over median household income; rent to income is twelve months of median rent over the same income.",
    ],
    caveats: [
      "Connecticut's ACS figures are by planning region, so its old-county pages have none.",
      "Valdez-Cordova, Alaska, split in 2019 and its medians can't be recombined.",
    ],
    updated: "2026-10-11",
  },
  {
    id: "county-visas",
    name: "Certified work-visa positions by county",
    source: "DOL Office of Foreign Labor Certification disclosure data, FY 2025",
    url: "https://www.dol.gov/agencies/eta/foreign-labor/performance",
    vintage: "Fiscal year 2025",
    script: "scripts/build-county-visas.py",
    outputs: [
      "public/data/county-visas.json",
      "public/data/county-visa-fields.json",
      "src/data/county-fips.json",
    ],
    caption:
      "Source: DOL OFLC case disclosure, FY 2025 (worksite). Population: Census Bureau, July 1, 2024 (Connecticut counties, July 1, 2021).",
    transformations: [
      "H-1B counts certified LCA positions; H-2A and H-2B count certified workers, including partial certifications.",
      "Each application is counted at its first worksite; blank worksite counties are assigned from the ZIP's largest land-area overlap.",
    ],
    caveats: [
      "A certified slot is permission to petition, not a visa issued or a person admitted.",
      "The same worker can appear in more than one program.",
    ],
    updated: "2026-10-13",
  },
  {
    id: "school-visas",
    name: "Certified positions at colleges and universities",
    source: "DOL Office of Foreign Labor Certification disclosure data, FY 2025",
    url: "https://www.dol.gov/agencies/eta/foreign-labor/performance",
    vintage: "Fiscal year 2025",
    script: "scripts/build-school-visas.py",
    outputs: ["src/data/schools.json", "public/data/school-visas.json"],
    caption: "Source: DOL OFLC case disclosure, FY 2025",
    transformations: [
      "Employers filing under NAICS 6112 or 6113 are included; counting matches the county build.",
    ],
    caveats: [
      "Hospitals that file under a hospital code are left out even if named for a university.",
    ],
    updated: "2026-10-13",
  },
  {
    id: "field-citizenship",
    name: "Workers by citizenship and field",
    source: "ACS 2024 1-year Public Use Microdata Sample",
    url: "https://www.census.gov/programs-surveys/acs/microdata/documentation/2024.html",
    vintage: "2024",
    script: "scripts/build-field-citizenship.py",
    outputs: ["src/data/field-citizenship.json"],
    caption: "Source: Census Bureau, ACS 2024 1-year PUMS",
    transformations: [
      "Civilian employed people, weighted by person weight, grouped by SOC major group.",
    ],
    caveats: [
      "The survey records citizenship, not visa class.",
      "A state share with fewer than 80 respondents is hidden.",
    ],
    updated: "2026-10-13",
  },
  {
    id: "generation-population",
    name: "Population by generation",
    source: "ACS 2020–2024 5-year table B01001",
    url: "https://data.census.gov/table/ACSDT5Y2024.B01001",
    vintage: "2020–2024",
    script: "scripts/build-state-generation-pop.py",
    outputs: ["src/data/state-generation-pop.json"],
    caption: "Source: Census Bureau, ACS 2020–2024 5-year",
    transformations: ["Census age bands that cross a generation cut are split evenly by year."],
    caveats: ["Ages are as of the 2024 estimate year."],
    updated: "2026-10-13",
  },
  {
    id: "state-religion",
    name: "Christian affiliation by state",
    source: "Pew Research Center, Religious Landscape Study 2023–24",
    url: "https://www.pewresearch.org/religious-landscape-study/",
    vintage: "2023–24",
    script: "scripts/build-states-data.py",
    outputs: ["scripts/data/religion.json", "src/data/states.json"],
    caption: "Source: Pew Religious Landscape Study 2023–24",
    transformations: ["Collected once into scripts/data/religion.json."],
    caveats: ["Survey estimates with state-level sampling error."],
    updated: "2026-09-30",
  },
  {
    id: "state-election",
    name: "Presidential popular vote by state, 1960–2024",
    source: "Certified state results (compiled from Wikipedia results-by-state tables)",
    url: "https://en.wikipedia.org/wiki/List_of_United_States_presidential_election_results_by_state",
    vintage: "1960–2024",
    script: "scripts/build-states-data.py",
    outputs: ["scripts/data/elections.json", "src/data/states.json"],
    caption: "Source: certified statewide results",
    transformations: ["Democratic and Republican shares of the statewide popular vote."],
    caveats: ["Maine and Nebraska split electoral votes by district; the figures are statewide."],
    updated: "2026-09-30",
  },
  {
    id: "midterms-2026",
    name: "2026 midterm elections: Senate results and House seats by state",
    source: "AP race calls and state election office counts, as compiled by Wikipedia",
    url: "https://en.wikipedia.org/wiki/2026_United_States_Senate_elections",
    vintage: "November 3, 2026 general election (provisional)",
    script: "scripts/build-midterms-2026.py",
    outputs: ["src/data/midterms-2026.json", "public/geo/us-house-districts-2026-albers.json"],
    caption: "Source: AP calls and state counts as compiled by Wikipedia (provisional)",
    transformations: [
      "Senate: each state's result infobox on the 2026 Senate elections page, with the margin taken between the Republican and the leading opponent.",
      "House: seats won by party from the Per state table on the 2026 House elections page; states the table leaves blank are tallied from their district rows.",
      "House districts: winners marked in each district row of the House elections page, keyed by Census GEOID; a row with no marked winner is uncalled.",
      "District lines (scripts/build-house-districts-2026.js): Census TIGER 2026 120th Congressional Districts via TIGERweb, which carry the 2025–26 redraws in AL, CA, FL, LA, NC, OH, TN, TX, and UT. Missouri uses its 2022 (119th Congress) districts, since its 2025 map was suspended by referendum for the 2026 election. Districts are clipped to the state outlines of the national map.",
      "The Wikipedia revision ids used are recorded in the output file.",
    ],
    caveats: [
      "Uncertified: states certify through mid-December 2026, and counts and calls can change until then.",
      "Alaska's Senate race awaits ranked-choice tabulation; Louisiana's House runoffs are pending.",
      "The House view is seats won, not the House popular vote, which is not yet compiled by state.",
      "DC has no Senate seat or voting House member.",
    ],
    updated: "2026-11-14",
  },
  {
    id: "immigration-sentiment",
    name: "Immigration sentiment by state",
    source: "PRRI, 2015 American Values Atlas",
    url: "https://ava.prri.org/",
    vintage: "2015",
    script: null,
    outputs: ["src/lib/states.ts"],
    caption: "Source: PRRI 2015 American Values Atlas",
    transformations: [
      "Share saying newcomers from other countries threaten traditional American customs and values.",
    ],
    caveats: ["DC was not surveyed.", "The survey is from 2015."],
    updated: "2026-09-30",
  },
  {
    id: "enforcement",
    name: "State immigration enforcement laws",
    source: "ILRC State Map on Immigration Enforcement",
    url: "https://www.ilrc.org/state-map-immigration-enforcement",
    vintage: "July 2026",
    script: null,
    outputs: ["src/lib/states.ts"],
    caption: "Source: ILRC State Map on Immigration Enforcement, July 2026",
    transformations: [
      "ILRC's 1–5 scores (1 = most enforcement, 5 = most protective) on ICE detainers, 287(g), information sharing, anti-sanctuary mandates, and state immigration crimes, averaged.",
    ],
    caveats: ["Scores reflect state law, not local practice."],
    updated: "2026-09-30",
  },
  {
    id: "family-formation",
    name: "Married homeowners at 30, and wealth held by those 30 and under",
    source: "ACS 2024 1-year cross-tabulations; Federal Reserve Distributional Financial Accounts",
    url: "https://www.federalreserve.gov/releases/z1/dataviz/dfa/",
    vintage: "2024",
    script: null,
    outputs: ["src/lib/states.ts", "src/lib/demographics.ts"],
    caption: "Source: Census Bureau, ACS 2024 1-year estimates",
    transformations: [
      "Married homeowner at 30: share of 30-year-olds married with spouse present who own their home.",
      "Wealth share at 30 and under is scaled down from the Fed's under-35 household share.",
    ],
    caveats: [
      "DC is excluded from both measures and their scales.",
      "The wealth share is an estimate.",
    ],
    updated: "2026-09-30",
  },
  {
    id: "work-visa-issuance",
    name: "Work visas issued and H-1B approvals",
    source:
      "State Department, Report of the Visa Office; USCIS, Characteristics of H-1B Specialty Occupation Workers",
    url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics.html",
    vintage: "FY 2020–2024 issuance; FY 2025 approvals",
    script: null,
    outputs: ["src/lib/work-visas.ts", "src/data/work-visa-states.ts"],
    caption: "Sources: State Department visa statistics; USCIS",
    transformations: ["Entered from the published tables."],
    caveats: [
      "Visas issued are not people admitted; most Canadian TN workers never receive a visa stamp.",
    ],
    updated: "2026-10-13",
  },
]

export const datasetById = Object.fromEntries(DATASETS.map((d) => [d.id, d])) as Record<
  DatasetId,
  Dataset
>

export function dataset(id: DatasetId): Dataset {
  return datasetById[id]
}

/** When any dataset was last regenerated (ISO date) */
export const DATA_LAST_UPDATED = DATASETS.map((d) => d.updated)
  .sort()
  .at(-1)!

/** Files under public/data that the methodology page offers as downloads */
export const DOWNLOADS = DATASETS.flatMap((d) =>
  d.outputs
    .filter((path) => path.startsWith("public/data/"))
    .map((path) => ({ dataset: d, path, href: path.replace(/^public/, "") })),
)
