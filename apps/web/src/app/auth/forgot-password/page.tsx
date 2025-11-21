'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { LogoIcon } from '@/components/ui/logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Lazy initialization to avoid build-time issues
  const getSupabase = () => createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4">
        {/* Background Effects - Same as Homepage Hero */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-[160px]" />
          <div className="absolute bottom-[-200px] -left-24 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent blur-[150px]" />
        </div>

        {/* Back to Login - Fixed Top Left */}
        <div className="fixed top-6 left-6 z-50">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6 relative z-10">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <LogoIcon size={48} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to your email
            </p>
          </div>

          {/* Success Message */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Email sent successfully!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setSuccess(false)}
            >
              Try different email
            </Button>
            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4">
      {/* Background Effects - Same as Homepage Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-[160px]" />
        <div className="absolute bottom-[-200px] -left-24 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent blur-[150px]" />
      </div>

      {/* Back to Login - Fixed Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/auth/login" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <LogoIcon size={48} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Reset Form */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center text-sm">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
