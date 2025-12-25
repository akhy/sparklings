# NoKTP

Indonesian NIK (Nomor Induk Kependudukan) Breakdown Tool

## About

NoKTP is a web-based tool that breaks down Indonesian KTP numbers (NIK) into easy-to-understand visual components. It parses the 16-digit NIK and displays:

- **Location Code**: Province, Regency/City, District
- **Birth Information**: Date, Month, Year
- **Gender**: Automatically detected (females have birth date + 40)
- **Serial Number**: Unique registration number

## NIK Structure

The 16-digit NIK follows this format:

```
PPRRDDDDMMYYSSSS
```

- **PP**: Province code (2 digits)
- **RR**: Regency/City code (2 digits)
- **DD**: District code (2 digits)
- **DD**: Birth date (2 digits, +40 for females)
- **MM**: Birth month (2 digits)
- **YY**: Birth year (2 digits)
- **SSSS**: Serial number (4 digits)

## Features

- ✅ Real-time NIK validation
- ✅ Visual breakdown with color coding
- ✅ Gender detection
- ✅ Date validation
- ✅ Completely offline - no data transmission

## Development

```bash
# Run dev server
pnpm dev --filter @sparklings/noktp

# Build
pnpm build --filter @sparklings/noktp

# Type check
pnpm typecheck --filter @sparklings/noktp

# Lint
pnpm lint --filter @sparklings/noktp
```

## Deployment

```bash
pnpm run --filter @sparklings/noktp deploy
```

## Port

Development server runs on port **5175**: http://localhost:5175

## Disclaimer

This tool is for educational purposes only. No NIK data is stored or transmitted. All processing happens locally in your browser.
