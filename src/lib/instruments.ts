import { readFileSync } from "fs"
import { join } from "path"

interface Instrument {
  trading_symbol: string
  instrument_key: string
  segment: string
  instrument_type?: string
}

let equityInstrumentMap: Map<string, string> | null = null

function loadEquityInstrumentMap() {
  const filePath = join(process.cwd(), "data", "complete.json")
  const raw = readFileSync(filePath, "utf-8")
  const allInstruments = JSON.parse(raw) as Instrument[]

  equityInstrumentMap = new Map(
    allInstruments
      .filter((instrument) =>
        instrument.segment === "NSE_EQ" &&
        instrument.instrument_type === "EQ" &&
        Boolean(instrument.trading_symbol) &&
        Boolean(instrument.instrument_key)
      )
      .map((instrument) => [
        instrument.trading_symbol.toUpperCase(),
        instrument.instrument_key,
      ])
  )

  return equityInstrumentMap
}

export function getInstrumentKeyBySymbol(symbol: string) {
  const instrumentMap = equityInstrumentMap ?? loadEquityInstrumentMap()
  return instrumentMap.get(symbol.toUpperCase())
}
