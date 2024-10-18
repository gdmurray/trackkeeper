import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

export function AnalysisSettings() {
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Settings</CardTitle>
        <CardDescription>
          Control how TrackKeeper analyzes your Spotify data
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='analyze-switch'>Pause Analyzing</Label>
          <Switch
            id='analyze-switch'
            checked={isAnalyzing}
            onCheckedChange={setIsAnalyzing}
          />
        </div>
        <span className='text-sm text-muted-foreground'>
          Last Analysed at 12:00 PM, October 16th, 2024
        </span>
      </CardContent>
    </Card>
  )
}
