export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className='flex-grow container mx-auto px-4 py-8'>{children}</main>
  )
}
