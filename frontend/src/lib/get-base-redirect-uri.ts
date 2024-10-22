export function getBaseRedirectUri() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    console.log('VERCEL URL: ', process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('BASE URL: ', process.env.NEXT_PUBLIC_BASE_URL)
    return `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  }
  return 'http://localhost:3001'
}
