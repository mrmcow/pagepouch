import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem signing you in. This could be due to an expired or invalid authentication link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Please try signing in again. If the problem persists, contact support.
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Try Again
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
