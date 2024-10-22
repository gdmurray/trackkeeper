import { NextResponse } from 'next/server'

export async function GET(request: NextResponse) {
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/settings/general`)
}
