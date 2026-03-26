import { google } from "googleapis"
import { GoogleAuth } from "google-auth-library"
import { createPrivateKey } from "crypto"
import type { sheets_v4 } from "googleapis"

function normalizePrivateKey(raw: string): string {
  let key = raw
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()

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

  return new GoogleAuth({
    credentials: { client_email, private_key: normalizePrivateKey(rawKey) },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  })
}

export type SheetGridRow = sheets_v4.Schema$RowData

/**
 * Fetch all sheets with cell values AND background color formatting in one call.
 */
export async function fetchAllSheetsWithFormatting(spreadsheetId: string): Promise<
  { title: string; rows: SheetGridRow[] }[]
> {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: true,
    fields:
      "sheets(properties/title,data/rowData/values(formattedValue,userEnteredFormat/backgroundColor))",
  })

  return (response.data.sheets ?? []).map((sheet) => ({
    title: sheet.properties?.title ?? "",
    rows: sheet.data?.[0]?.rowData ?? [],
  }))
}
