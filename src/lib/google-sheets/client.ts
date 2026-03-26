import { google } from "googleapis"
import { GoogleAuth } from "google-auth-library"

function getAuth() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!client_email || !private_key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY")
  }

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
