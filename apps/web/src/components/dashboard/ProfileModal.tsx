'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Calendar, User, AlertTriangle } from 'lucide-react'
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
    setNewEmail(user.email)
  }, [user.email])

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
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleEmailUpdate}
                    disabled={isLoading || newEmail === user.email}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Changing your email will require verification of both old and new addresses.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(user.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          {subscriptionData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Plan</span>
                  <Badge variant={getSubscriptionBadgeVariant(subscriptionData.subscriptionTier, subscriptionData.subscriptionStatus)}>
                    {subscriptionData.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage this month</span>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionData.clipsThisMonth}/{subscriptionData.clipsLimit} clips
                  </span>
                </div>

                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min((subscriptionData.clipsThisMonth / subscriptionData.clipsLimit) * 100, 100)}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border-t my-6" />

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
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
