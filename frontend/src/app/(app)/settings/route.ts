import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/settings/general`)
}
