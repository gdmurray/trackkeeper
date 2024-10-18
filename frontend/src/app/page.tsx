import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Headphones,
  Music2,
  CheckCircle,
  ListMusic,
  RefreshCcw,
  Binoculars,
  ListVideo,
} from 'lucide-react'
import Link from 'next/link'
import { SpotifyFilled } from '@ant-design/icons'

export const metadata = {
  title: 'TrackKeeper',
}

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <header className='px-4 lg:px-6 h-14 flex items-center justify-between max-w-7xl mx-auto w-full bg-background'>
        <Link className='flex items-center justify-center' href='#'>
          <Headphones className='h-6 w-6' />
          <span className='ml-2 text-2xl font-bold'>TrackKeeper</span>
        </Link>
        <nav className='ml-auto flex gap-4 sm:gap-6 items-center'>
          <Link
            className='text-sm font-medium hover:underline underline-offset-4'
            href='#features'
          >
            Features
          </Link>
          <Link
            className='text-sm font-medium hover:underline underline-offset-4'
            href='#how-it-works'
          >
            How It Works
          </Link>
          <Button asChild size={'sm'} className='h-8' variant={'outline'}>
            <Link href={'/login'}>Login</Link>
          </Button>
          {/* <Link
            className='text-sm font-medium hover:underline underline-offset-4'
            href='#pricing'
          >
            Pricing
          </Link> */}
        </nav>
      </header>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24 lg:py-32 xl:py-48'>
          <div className='container px-4 md:px-6 max-w-2xl mx-auto'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                  Never Lose Track of Your{' '}
                  <span className='bg-gradient-to-b from-[#1DB954] to-[#158f40] bg-clip-text text-transparent'>
                    Favorite Songs
                  </span>
                </h1>
                <p className='mx-auto max-w-[700px] text-muted-foreground md:text-xl'>
                  TrackKeeper monitors your Spotify account and keeps a record
                  of your recently removed tracks. Don&apos;t let your music
                  memories fade away!
                </p>
              </div>
              <div className='space-x-4'>
                <Button asChild>
                  <Link href={'/signup'}>Get Started</Link>
                </Button>
                <Button variant='outline' asChild>
                  <Link href={'#features'}>Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id='features'
          className='w-full py-12 md:py-24 lg:py-32 bg-secondary/30'
        >
          <div className='container px-4 md:px-6 max-w-6xl mx-auto'>
            <h2 className='text-3xl spotify-gradient-text font-bold tracking-tighter sm:text-5xl text-center mb-12'>
              Features
            </h2>
            <div className='grid gap-6 lg:grid-cols-3 lg:gap-12'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <SpotifyFilled /> Spotify Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Connect your Spotify account seamlessly and let TrackKeeper
                    do the rest.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Binoculars />
                    Track Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Monitor your liked songs or specific playlists for any
                    removed tracks.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ListVideo /> Playlist Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Automatically create playlists of your removed songs or view
                    them in the app.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id='how-it-works' className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container px-4 md:px-6 max-w-6xl mx-auto'>
            <h2 className='spotify-gradient-text text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
              How It Works
            </h2>
            <div className='grid gap-6 lg:grid-cols-3 lg:gap-12 items-start'>
              <div className='flex flex-col items-center space-y-2 border-border p-4 rounded-lg'>
                <Music2 className='h-12 w-12 text-primary' />
                <h3 className='text-xl font-bold'>Connect</h3>
                <p className='text-center'>
                  Link your Spotify account to TrackKeeper with just a few
                  clicks.
                </p>
              </div>
              <div className='flex flex-col items-center space-y-2 border-border p-4 rounded-lg'>
                <ListMusic className='h-12 w-12 text-primary' />
                <h3 className='text-xl font-bold'>Monitor</h3>
                <p className='text-center'>
                  Choose which playlists or liked songs you want to keep track
                  of.
                </p>
              </div>
              <div className='flex flex-col items-center space-y-2 border-border p-4 rounded-lg'>
                <RefreshCcw className='h-12 w-12 text-primary' />
                <h3 className='text-xl font-bold'>Recover</h3>
                <p className='text-center'>
                  View your removed tracks and optionally create a new playlist
                  with them.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* <section
          id='pricing'
          className='w-full py-12 md:py-24 lg:py-32 bg-secondary/30'
        >
          <div className='container px-4 md:px-6 max-w-5xl mx-auto'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
              Pricing
            </h2>
            <div className='grid gap-6 lg:grid-cols-2 lg:gap-12 max-w-3xl mx-auto'>
              <Card>
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-4xl font-bold mb-2'>$4.99</div>
                  <p className='text-muted-foreground mb-4'>per month</p>
                  <ul className='space-y-2'>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Monitor up to 5 playlists
                    </li>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Weekly reports
                    </li>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Basic support
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-4xl font-bold mb-2'>$9.99</div>
                  <p className='text-muted-foreground mb-4'>per month</p>
                  <ul className='space-y-2'>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Unlimited playlist monitoring
                    </li>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Daily reports
                    </li>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Priority support
                    </li>
                    <li className='flex items-center'>
                      <CheckCircle className='h-5 w-5 text-primary mr-2' />
                      Advanced analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}
      </main>
      <footer className='flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t max-w-7xl mx-auto'>
        <p className='text-xs text-muted-foreground'>
          © 2024 TrackKeeper. All rights reserved.
        </p>
        <nav className='sm:ml-auto flex gap-4 sm:gap-6'>
          <Link className='text-xs hover:underline underline-offset-4' href='#'>
            Terms of Service
          </Link>
          <Link className='text-xs hover:underline underline-offset-4' href='#'>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
