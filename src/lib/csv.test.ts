import { describe, expect, it } from "vitest"

import { csvFileName, toCsv } from "@/lib/csv"

describe("toCsv", () => {
  it("writes a header and rows with CRLF line endings", () => {
    expect(toCsv([{ state: "Ohio", share: 75.1 }, { state: "Utah", share: 76 }])).toBe(
      "state,share\r\nOhio,75.1\r\nUtah,76\r\n"
    )
  })

  it("quotes commas, quotes, and line breaks", () => {
    expect(toCsv([{ name: 'Lewis and Clark, MT', note: 'say "hi"', text: "a\nb" }])).toBe(
      'name,note,text\r\n"Lewis and Clark, MT","say ""hi""","a\nb"\r\n'
    )
  })

  it("leaves null and undefined empty and keeps zero and false", () => {
    expect(toCsv([{ a: null, b: undefined, c: 0, d: false }])).toBe("a,b,c,d\r\n,,0,false\r\n")
  })

  it("uses the given column order and fills missing fields", () => {
    expect(toCsv([{ b: 2, a: 1 }, { a: 3 }], ["a", "b"])).toBe("a,b\r\n1,2\r\n3,\r\n")
  })

  it("collects columns from every row when none are given", () => {
    expect(toCsv([{ a: 1 }, { b: 2 }])).toBe("a,b\r\n1,\r\n,2\r\n")
  })

  it("writes just a header line for no rows", () => {
    expect(toCsv([], ["a"])).toBe("a\r\n")
  })
})

describe("csvFileName", () => {
  it("slugifies titles", () => {
    expect(csvFileName("Highest non-Hispanic White share")).toBe(
      "highest-non-hispanic-white-share.csv"
    )
    expect(csvFileName("!!!")).toBe("data.csv")
  })
})
