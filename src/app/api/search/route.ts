import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

interface Instrument {
    trading_symbol: string;
    name: string;
    instrument_key: string;
    segment: string;
    instrument_type?: string;
}

let equityInstruments: Instrument[] | null = null;

function getInstruments(): Instrument[] {
    if (equityInstruments) return equityInstruments;
    const filePath = join(process.cwd(), "data", "complete.json");
    const raw = readFileSync(filePath, "utf-8");
    const all = JSON.parse(raw) as Instrument[];
    equityInstruments = all.filter(
        (i) => i.segment === "NSE_EQ" && i.instrument_type === "EQ"
    );
    return equityInstruments;
}

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();

    if (!q) return NextResponse.json({ results: [] });

    const instruments = getInstruments();

    const results = instruments
        .filter((i) =>
            i.trading_symbol.toLowerCase().includes(q) ||
            i.name.toLowerCase().includes(q)
        )
        .slice(0, 10)
        .map((i) => ({
            trading_symbol: i.trading_symbol,
            name: i.name,
            instrument_key: i.instrument_key,
        }));

    return NextResponse.json({ results });
}
