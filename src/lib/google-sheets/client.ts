import { google } from "googleapis"
import { GoogleAuth } from "google-auth-library"
import { createPrivateKey } from "crypto"

/**
 * Normalise the private key coming from .env.local / Vercel env vars.
 * Handles: surrounding quotes, literal \n, CRLF, and PKCS#1 → PKCS#8 upgrade.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw
    .replace(/^["']|["']$/g, "")  // strip accidental surrounding quotes
    .replace(/\\n/g, "\n")         // literal \n → real newline
    .replace(/\r\n/g, "\n")        // CRLF → LF
    .replace(/\r/g, "\n")          // bare CR → LF
    .trim()

  // If it's PKCS#1 ("BEGIN RSA PRIVATE KEY"), convert to PKCS#8 so that
  // google-auth-library's createSign call works on every OpenSSL 3 build.
  if (key.includes("BEGIN RSA PRIVATE KEY")) {
    key = createPrivateKey(key).export({ type: "pkcs8", format: "pem" }) as string
  }

  return key
}

function getAuth() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY

  if (!client_email || !rawKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY")
  }

  const private_key = normalizePrivateKey(rawKey)

  return new GoogleAuth({
    credentials: { client_email, private_key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })
}

export async function batchGetSheetValues(
  spreadsheetId: string,
  ranges: string[]
): Promise<(string[][] | null)[]> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE",
  })

  return (response.data.valueRanges ?? []).map((r) => r.values ?? null)
}

export async function getSheetMetadata(spreadsheetId: string) {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  })

  return response.data.sheets ?? []
}
