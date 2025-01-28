'use server'

import { ServerFunctionResponse } from '@/lib/serverFunction'
import { cookies } from 'next/headers'
import { CreateEmailResponse, Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const AUTHOR_EMAIL = process.env.AUTHOR_EMAIL

const RATE_LIMIT_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const MAX_REQUESTS = 3 // Maximum number of requests per 24 hours

export async function sendAuthorizationEmail(
  email: string
): Promise<ServerFunctionResponse<CreateEmailResponse>> {
  console.log('Sending authorization email to: ', email)
  if (!AUTHOR_EMAIL) {
    throw new Error('AUTHOR_EMAIL is not set')
  }
  const cookieStore = await cookies()
  const rateLimitCookie = cookieStore.get('auth_email_rate_limit')
  let rateLimit = rateLimitCookie
    ? JSON.parse(rateLimitCookie.value)
    : { count: 0, timestamp: Date.now() }

  // Reset rate limit if it's been more than 24 hours
  if (Date.now() - rateLimit.timestamp > RATE_LIMIT_DURATION) {
    rateLimit = { count: 0, timestamp: Date.now() }
  }

  // Check if rate limit has been exceeded
  if (rateLimit.count >= MAX_REQUESTS) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  try {
    const data = await resend.emails.send({
      from: 'TrackKeeper <app@trackkeeper.app>',
      to: [AUTHOR_EMAIL],
      subject: 'Authorization Request',
      text: `A user has requested authorization to use TrackKeeper. The user's email is ${email}`,
    })
    // Update rate limit
    rateLimit.count += 1
    cookieStore.set('auth_email_rate_limit', JSON.stringify(rateLimit), {
      maxAge: RATE_LIMIT_DURATION / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    console.log('Email sent successfully: ', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending authorization email: ', error)
    return {
      success: false,
      error: `Error sending authorization email: ${error}`,
    }
  }
}
