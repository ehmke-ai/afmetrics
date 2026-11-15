"""
Generates src/data/midterms-2026.json for the 2026 midterms view of the US state map:

  senate: { ABBR: { status, special, candidates: [{ name, party, votes, pct }] } }
      Every state with a Senate race on November 3, 2026, with its top candidates as reported.
      party is D (Democratic, incl. Minnesota DFL), R, I (independent), or O (other).
      status is "uncalled" while the race is still being counted (votes may be null).
  house: { ABBR: { seats, dem, rep, other, uncalled } }
      Seats won by party in each state's House delegation; uncalled = not yet decided.

Results are provisional: states certify through early-to-mid December 2026. Re-run this script
to pick up new counts and calls; `asOf` and the source revisions are written into the file.

Source (cached in scripts/.cache, keyed by revision): Wikipedia's "2026 United States Senate
elections" (per-state result infoboxes) and "2026 United States House of Representatives
elections" (Per state table), which compile AP calls and state election office counts.

Adjustments:
  - The House Per state table leaves a state blank until editors fill it in (Alaska, Louisiana,
    and Minnesota at first build). For those, seats are tallied from the winners marked in that
    state's district rows on the same page; seats with no marked winner count as uncalled.
  - DC has no Senate seat or voting House member and is omitted.
"""

import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".cache"
OUT = ROOT / "src" / "data" / "midterms-2026.json"
API = "https://en.wikipedia.org/w/api.php"
SENATE_PAGE = "2026_United_States_Senate_elections"
HOUSE_PAGE = "2026_United_States_House_of_Representatives_elections"
USER_AGENT = "afmetrics-data-build/1.0"

STATE_ABBR = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}


def fetch(page):
    """Latest wikitext and revision id of a page, cached by revision"""
    query = urllib.parse.urlencode({
        "action": "query", "prop": "revisions", "titles": page, "rvprop": "ids|content",
        "rvslots": "main", "format": "json", "formatversion": "2",
    })
    req = urllib.request.Request(f"{API}?{query}", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req) as res:
        rev = json.load(res)["query"]["pages"][0]["revisions"][0]
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{page}.{rev['revid']}.wiki"
    if not path.exists():
        path.write_text(rev["slots"]["main"]["content"])
    return path.read_text(), rev["revid"]


def clean(value):
    value = re.sub(r"<ref[^>]*/>|<ref.*?</ref>", "", value or "", flags=re.S)
    value = re.sub(r"<!--.*?-->", "", value, flags=re.S)
    value = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", value)
    return value.replace("'''", "").replace("''", "").strip()


def party_code(name):
    name = name or ""
    if "Democratic" in name:  # includes Minnesota Democratic–Farmer–Labor
        return "D"
    if "Republican" in name:
        return "R"
    if "Independent" in name:
        return "I"
    return "O"


def number(value):
    value = value.replace(",", "").replace("%", "").strip()
    return float(value) if value else None


def senate(text):
    races = {}
    sections = re.split(r"^== (.+?) ==\s*$", text, flags=re.M)
    for heading, body in zip(sections[1::2], sections[2::2]):
        state = heading.replace("(special)", "").strip()
        if state not in STATE_ABBR:
            continue
        box = re.search(r"\{\{Infobox election(.*?)\n\}\}", body, re.S)
        if not box:
            continue
        fields = {}
        for line in box.group(1).split("\n| "):
            if "=" in line:
                key, value = line.split("=", 1)
                fields[key.strip()] = clean(value)
        candidates = []
        for i in range(1, 8):
            name = fields.get(f"nominee{i}") or fields.get(f"candidate{i}")
            if not name:
                continue
            votes = number(fields.get(f"popular_vote{i}", ""))
            pct = number(fields.get(f"percentage{i}", ""))
            candidates.append({
                "name": name,
                "party": party_code(fields.get(f"party{i}")),
                "votes": int(votes) if votes is not None else None,
                "pct": round(pct, 1) if pct is not None else None,
            })
        counted = all(c["pct"] is not None for c in candidates)
        called = fields.get("ongoing") != "yes" and bool(fields.get("after_party")) and counted
        if counted:
            candidates.sort(key=lambda c: -c["pct"])
        abbr = STATE_ABBR[state]
        if abbr in races:
            sys.exit(f"two Senate races in {state}; the map shows one per state")
        races[abbr] = {
            "status": "called" if called else "uncalled",
            "special": "(special)" in heading,
            "candidates": candidates,
        }
    return races


# A district row header; a seat with two incumbents spans two rows ("!rowspan=2 |{{ushr|...}}")
DISTRICT_ROW = r"^\s*!(?:rowspan=\d+\s*\|)?\s*\{\{ushr\|([A-Z]{2})\|([^|}]+)"


def district_tally(text, state):
    """Seats by winning party from a state's district rows (winners carry {{Aye}})"""
    section = re.search(rf"^=={re.escape(state)}==\s*$(.*?)(?=^==[^=])", text, re.M | re.S)
    if not section:
        sys.exit(f"no House section for {state}")
    rows = [r for r in re.split(r"\n\|-", section.group(1)) if re.search(DISTRICT_ROW, r, re.M)]
    tally = {"dem": 0, "rep": 0, "other": 0, "uncalled": 0}
    for row in rows:
        winner = re.search(r"\{\{Party stripe\|([^}]+)\}\}\{\{[Aa]ye\}\}", row)
        if not winner:
            tally["uncalled"] += 1
        else:
            key = {"D": "dem", "R": "rep"}.get(party_code(winner.group(1)), "other")
            tally[key] += 1
    return len(rows), tally


FIPS = {
    "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06", "CO": "08", "CT": "09",
    "DE": "10", "FL": "12", "GA": "13", "HI": "15", "ID": "16", "IL": "17", "IN": "18",
    "IA": "19", "KS": "20", "KY": "21", "LA": "22", "ME": "23", "MD": "24", "MA": "25",
    "MI": "26", "MN": "27", "MS": "28", "MO": "29", "MT": "30", "NE": "31", "NV": "32",
    "NH": "33", "NJ": "34", "NM": "35", "NY": "36", "NC": "37", "ND": "38", "OH": "39",
    "OK": "40", "OR": "41", "PA": "42", "RI": "44", "SC": "45", "SD": "46", "TN": "47",
    "TX": "48", "UT": "49", "VT": "50", "VA": "51", "WA": "53", "WV": "54", "WI": "55",
    "WY": "56",
}
WINNER = r"\{\{(?:[Aa]ye|[Yy]ea)\}\}"
CANDIDATE = re.compile(r"^\*\{\{Party stripe\|([^}]+)\}\}(.*)$", re.M)


def candidate_name(rest):
    rest = re.sub(r"\{\{[^}]*\}\}", "", rest)
    rest = re.sub(r"\s*[\d.]+\s*%\s*$", "", clean(rest))  # some rows append the vote share
    rest = re.sub(r"\s*\([^)]*\)\s*$", "", rest)
    return rest.strip()


def districts(text):
    """
    Every district's result keyed by Census GEOID (state FIPS + 2-digit district, 00 at-large):
    { party, winner, flip, incumbentParty, runoff } where party/winner are null while uncalled and
    runoff lists the two candidates advancing where a runoff is pending ({{mby}} marks).
    """
    out = {}
    for state, abbr in STATE_ABBR.items():
        section = re.search(rf"^=={re.escape(state)}==\s*$(.*?)(?=^==[^=])", text, re.M | re.S)
        if not section:
            sys.exit(f"no House section for {state}")
        for row in re.split(r"\n\|-", section.group(1)):
            m = re.search(DISTRICT_ROW, row, re.M)
            if not m:
                continue
            if m.group(1) != abbr:
                sys.exit(f"{state} section has a {m.group(1)} row")
            seat = m.group(2)
            geoid = FIPS[abbr] + ("00" if seat.upper() in ("AL", "AT-LARGE") else f"{int(seat):02d}")
            cells = row.split("\n|")
            incumbent = party_code(next((c for c in cells if re.search(r"background-color:#(?:FFB6B6|B0CEFF)", c)), ""))
            winner = party = None
            runoff = []
            for stripe, rest in CANDIDATE.findall(row):
                if re.search(WINNER, rest):
                    winner, party = candidate_name(rest), party_code(stripe)
                elif "{{mby}}" in rest.lower():
                    runoff.append({"name": candidate_name(rest), "party": party_code(stripe)})
            if geoid in out:
                sys.exit(f"two rows for {geoid}")
            out[geoid] = {
                "party": party,
                "winner": winner,
                "flip": bool(party and incumbent in ("D", "R") and party != incumbent and "gain" in row.lower()),
                "incumbentParty": incumbent if incumbent in ("D", "R") else None,
                "runoff": runoff if not winner else [],
            }
    if len(out) != 435:
        sys.exit(f"{len(out)} district rows, expected 435")
    return dict(sorted(out.items()))


def check_districts(delegations, by_district):
    """The district rows should add up to the Per state table; report any state that doesn't"""
    for abbr, d in delegations.items():
        rows = [r for g, r in by_district.items() if g[:2] == FIPS[abbr]]
        tally = {
            "dem": sum(r["party"] == "D" for r in rows),
            "rep": sum(r["party"] == "R" for r in rows),
            "other": sum(r["party"] not in (None, "D", "R") for r in rows),
            "uncalled": sum(r["party"] is None for r in rows),
        }
        if len(rows) != d["seats"] or any(tally[k] != d[k] for k in tally):
            print(f"  warning {abbr}: Per state table {d}, district rows {tally}")


def house(text):
    table = text.split("=== Per state ===", 1)[1].split("\n|}", 1)[0]
    delegations = {}
    for row in table.split("\n|-")[1:]:
        m = re.search(r"!\[\[#([^|\]]+)", row)
        if not m or m.group(1) not in STATE_ABBR:
            continue
        state = m.group(1)
        cells = [re.sub(r".*\|", "", c).replace("'''", "").strip() for c in row.strip().split("\n")[1:]]
        seats = int(cells[0])
        dem, rep = cells[1], cells[3]
        if dem.isdigit() and rep.isdigit():
            tally = {"dem": int(dem), "rep": int(rep), "other": 0}
            tally["uncalled"] = seats - tally["dem"] - tally["rep"]
        else:
            rows, tally = district_tally(text, state)
            if rows != seats:
                sys.exit(f"{state}: {rows} district rows but {seats} seats")
            print(f"  {state}: Per state row blank; tallied districts {tally}")
        if min(tally.values()) < 0:
            sys.exit(f"{state}: more seats called than exist")
        delegations[STATE_ABBR[state]] = {"seats": seats, **tally}
    if len(delegations) != 50 or sum(d["seats"] for d in delegations.values()) != 435:
        sys.exit(f"expected 50 states and 435 seats, got {len(delegations)} states")
    return delegations


def main():
    senate_text, senate_rev = fetch(SENATE_PAGE)
    house_text, house_rev = fetch(HOUSE_PAGE)
    out = {
        "asOf": date.today().isoformat(),
        "sources": {
            "senate": f"https://en.wikipedia.org/w/index.php?title={SENATE_PAGE}&oldid={senate_rev}",
            "house": f"https://en.wikipedia.org/w/index.php?title={HOUSE_PAGE}&oldid={house_rev}",
        },
        "senate": dict(sorted(senate(senate_text).items())),
        "house": dict(sorted(house(house_text).items())),
        "districts": districts(house_text),
    }
    check_districts(out["house"], out["districts"])
    OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    s, h = out["senate"], out["house"].values()
    print(
        f"wrote {OUT.relative_to(ROOT)}: {len(s)} Senate races "
        f"({sum(r['status'] == 'uncalled' for r in s.values())} uncalled); House "
        f"D {sum(d['dem'] for d in h)}, R {sum(d['rep'] for d in h)}, "
        f"other {sum(d['other'] for d in h)}, uncalled {sum(d['uncalled'] for d in h)}"
    )


if __name__ == "__main__":
    main()
