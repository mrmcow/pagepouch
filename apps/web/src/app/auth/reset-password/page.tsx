'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { LogoIcon } from '@/components/ui/logo'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Lazy initialization to avoid build-time issues
  const getSupabase = () => createClient()

  useEffect(() => {
    // Check if user has an active session (after callback)
    const checkSession = async () => {
      const supabase = getSupabase()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setError('Invalid or expired reset link. Please request a new one.')
      }
      
      setIsCheckingSession(false)
    }
    
    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const supabase = getSupabase()
      
      // Check session again before updating
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Session expired. Please request a new password reset link.')
        setIsLoading(false)
        return
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
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
        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <LogoIcon size={48} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Password updated!</h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset
            </p>
          </div>

          {/* Success Message */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Password reset successful!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your password has been updated. You'll be redirected to your dashboard shortly.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
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
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4">
        {/* Background Effects - Same as Homepage Hero */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-[160px]" />
          <div className="absolute bottom-[-200px] -left-24 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/20 via-blue-500/10 to-transparent blur-[150px]" />
        </div>
        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <LogoIcon size={48} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">
              Preparing password reset
            </p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
