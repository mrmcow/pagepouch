'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, Lock, User, ArrowLeft, Check, Eye, EyeOff, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { LogoIcon } from '@/components/ui/logo'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  
  // Lazy initialization to avoid build-time issues
  const getSupabase = () => createClient()

  // Password validation requirements
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.met)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  const handleCopyPassword = () => {
    setConfirmPassword(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!allRequirementsMet) {
      setError('Please meet all password requirements')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    try {
      const supabase = getSupabase()
      
      console.log('🚀 Starting signup for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      console.log('📧 Signup response:', { data, error })

      if (error) {
        console.error('❌ Signup error:', error)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log('✅ User created:', data.user)
        console.log('📮 Email confirmation status:', data.user.email_confirmed_at ? 'Confirmed' : 'Pending confirmation')
        
        if (data.user.email_confirmed_at) {
          // Email already confirmed, redirect to dashboard
          console.log('🎉 User already confirmed, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          // Show success message for email confirmation
          console.log('📬 Showing confirmation message, check your email!')
          setSuccess(true)
        }
      } else {
        console.warn('⚠️ No user data returned')
      }
    } catch (err) {
      console.error('💥 Signup error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to activate your account and start using PagePouch.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Back to Home - Fixed Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <LogoIcon size={48} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Start your free trial</h1>
          <p className="text-muted-foreground">
            Create your PagePouch account in seconds
          </p>
        </div>

        {/* Free Trial Benefits */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Free Trial Includes:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-primary mr-2" />
                  100 clips per month
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-primary mr-2" />
                  Full-page screenshot capture
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-primary mr-2" />
                  Search and organization
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 text-primary mr-2" />
                  Cross-device sync
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Sign Up Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Get started with your free PagePouch account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-20"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    {password && allRequirementsMet && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Copy to confirm password"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {password && (
                  <div className="mt-3 space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Password Requirements:</p>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className={`flex-shrink-0 rounded-full p-0.5 ${req.met ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                          <Check className={`h-3 w-3 ${req.met ? 'text-white' : 'text-transparent'}`} />
                        </div>
                        <span className={req.met ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2 text-xs mt-2">
                    <div className={`flex-shrink-0 rounded-full p-0.5 ${passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Check className={`h-3 w-3 ${passwordsMatch ? 'text-white' : 'text-transparent'}`} />
                    </div>
                    <span className={passwordsMatch ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms || !allRequirementsMet || !passwordsMatch}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

          {/* Sign In Link */}
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
