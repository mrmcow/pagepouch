'use client'

import { useState } from 'react'
import { User, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserAvatarProps {
  user: {
    email: string
    id: string
  }
  onProfileClick: () => void
  onBillingClick: () => void
}

export function UserAvatar({ user, onProfileClick, onBillingClick }: UserAvatarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Generate sophisticated gradient based on email
  const getAvatarGradient = (email: string) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600', 
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-amber-500 to-amber-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600',
      'from-cyan-500 to-cyan-600',
      'from-violet-500 to-violet-600'
    ]
    const index = email.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  // Get initials from email (first letter + first letter after @)
  const getInitials = (email: string) => {
    const parts = email.split('@')
    const firstLetter = parts[0].charAt(0).toUpperCase()
    const domainLetter = parts[1] ? parts[1].charAt(0).toUpperCase() : ''
    return firstLetter + domainLetter
  }

  // Get display name from email
  const getDisplayName = (email: string) => {
    const username = email.split('@')[0]
    return username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, ' ')
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-auto p-2 hover:bg-white/10 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            {/* Modern Avatar */}
            <div className="relative">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(user.email)} flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-white/20`}
              >
                {getInitials(user.email)}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            
            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {getDisplayName(user.email)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                {user.email}
              </div>
            </div>
            
            {/* Chevron */}
            <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-2">
            <div
              className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarGradient(user.email)} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}
            >
              {getInitials(user.email)}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">
                {getDisplayName(user.email)}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
          <User className="mr-3 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBillingClick} className="cursor-pointer">
          <CreditCard className="mr-3 h-4 w-4" />
          <span>Billing & Subscription</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
