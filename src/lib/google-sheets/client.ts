import { google } from "googleapis"
import { createPrivateKey } from "crypto"

export function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!email || !rawKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY")
  }

  // Node 18+ / OpenSSL 3 requires PKCS#8 format; Google issues PKCS#1 keys.
  // Convert on the fly to avoid "DECODER routines::unsupported" errors.
  const key = createPrivateKey(rawKey).export({ type: "pkcs8", format: "pem" }) as string

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })
}

export async function batchGetSheetValues(
  spreadsheetId: string,
  ranges: string[]
): Promise<(string[][] | null)[]> {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE",
  })

  return (response.data.valueRanges ?? []).map((r) => r.values ?? null)
}

export async function getSheetMetadata(spreadsheetId: string) {
  const auth = getAuthClient()
  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  })

  return response.data.sheets ?? []
}
