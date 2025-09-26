'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Calendar, User, AlertTriangle, CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    email: string
    created_at?: string
  }
  subscriptionData?: {
    subscriptionTier: 'free' | 'pro'
    subscriptionStatus: string
    clipsThisMonth: number
    clipsLimit: number
  }
}

export function ProfileModal({ isOpen, onClose, user, subscriptionData }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newEmail, setNewEmail] = useState(user.email)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      setNewEmail(user.email)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }, [user.email, isOpen])

  const handleEmailUpdate = async () => {
    if (newEmail === user.email) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      alert('Email update initiated. Please check both your old and new email for confirmation links.')
      onClose()
    } catch (error) {
      console.error('Email update error:', error)
      alert('Failed to update email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.')
      return
    }

    setIsLoading(true)
    try {
      // Call our API to handle account deletion
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Account deletion error:', error)
      alert('Failed to delete account. Please contact support.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSubscriptionBadgeVariant = (tier: string, status: string) => {
    if (tier === 'pro' && status === 'active') return 'default'
    if (tier === 'free') return 'secondary'
    return 'destructive'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="flex gap-3">
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleEmailUpdate}
                    disabled={isLoading || newEmail === user.email}
                    size="sm"
                    className="px-4"
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Changing your email will require verification of both old and new addresses.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="p-1.5 bg-gray-100 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>Member since {formatDate(user.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          {subscriptionData && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Current Plan</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {subscriptionData.subscriptionTier === 'pro' ? '1,000 clips/month + 5GB storage' : '50 clips/month + 100MB storage'}
                    </p>
                  </div>
                  <Badge variant={getSubscriptionBadgeVariant(subscriptionData.subscriptionTier, subscriptionData.subscriptionStatus)}>
                    {subscriptionData.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usage this month</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {subscriptionData.clipsThisMonth}/{subscriptionData.clipsLimit} clips
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((subscriptionData.clipsThisMonth / subscriptionData.clipsLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {subscriptionData.clipsLimit - subscriptionData.clipsThisMonth} clips remaining this month
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border-t my-6" />

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-red-700 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600/80">
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your account, all clips, folders, and cancel any active subscription. 
                    This action cannot be undone.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete">
                      Type "DELETE" to confirm:
                    </Label>
                    <Input
                      id="confirm-delete"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isLoading || deleteConfirmText !== 'DELETE'}
                    >
                      {isLoading ? 'Deleting...' : 'Permanently Delete Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
