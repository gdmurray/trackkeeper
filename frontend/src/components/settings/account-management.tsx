import { Button } from '../ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'

export function AccountManagement() {
  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    console.log('Account deletion requested')
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
        <CardDescription>Manage your TrackKeeper account</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant='destructive' onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </CardContent>
    </Card>
  )
}
