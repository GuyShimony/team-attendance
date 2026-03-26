import { google } from "googleapis"

export function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!email || !key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY")
  }

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
