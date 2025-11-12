'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Plus, 
  ArrowLeft, 
  Network, 
  Sparkles, 
  Clock, 
  FolderOpen,
  Users,
  Zap,
  Search,
  FileText,
  TrendingUp
} from 'lucide-react'
import { LogoIcon } from '@/components/ui/logo'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ProfileModal } from '@/components/dashboard/ProfileModal'
import { BillingModal } from '@/components/dashboard/BillingModal'

interface KnowledgeGraphDashboardState {
  user: any
  subscriptionTier: 'free' | 'pro'
  subscriptionStatus: string
  clipsThisMonth: number
  clipsLimit: number
  isSubscriptionLoading: boolean
  isProfileModalOpen: boolean
  isBillingModalOpen: boolean
  graphs: Array<{
    id: string
    name: string
    nodeCount: number
    folderCount: number
    lastUpdated: string
    thumbnail?: string
  }>
  isLoading: boolean
}

function KnowledgeGraphDashboardContent() {
  const [state, setState] = useState<KnowledgeGraphDashboardState>({
    user: null,
    subscriptionTier: 'free',
    subscriptionStatus: 'inactive',
    clipsThisMonth: 0,
    clipsLimit: 10,
    isSubscriptionLoading: true,
    isProfileModalOpen: false,
    isBillingModalOpen: false,
    graphs: [],
    isLoading: true
  })

  const router = useRouter()

  useEffect(() => {
    loadUserData()
    loadGraphs()
  }, [])

  const loadUserData = async () => {
    try {
      // Load subscription data
      const subscriptionResponse = await fetch('/api/subscription', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (subscriptionResponse.ok) {
        const subData = await subscriptionResponse.json()
        setState(prev => ({
          ...prev,
          subscriptionTier: subData.subscription_tier || 'free',
          subscriptionStatus: subData.subscription_status || 'inactive',
          clipsThisMonth: subData.clips_this_month || 0,
          clipsLimit: subData.subscription_tier === 'pro' ? 1000 : 10,
          isSubscriptionLoading: false,
        }))
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      setState(prev => ({ ...prev, isSubscriptionLoading: false }))
    }
  }

  const loadGraphs = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, show empty state
      setState(prev => ({ ...prev, graphs: [], isLoading: false }))
    } catch (error) {
      console.error('Failed to load graphs:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <LogoIcon size={32} />
                <span className="text-xl font-bold">PageStash</span>
              </Link>
              <div className="hidden md:flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Knowledge Graphs</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!state.isSubscriptionLoading && (
                <UserAvatar
                  user={{
                    email: state.user?.email || 'user@example.com',
                    id: state.user?.id || ''
                  }}
                  onProfileClick={() => setState(prev => ({ ...prev, isProfileModalOpen: true }))}
                  onBillingClick={() => setState(prev => ({ ...prev, isBillingModalOpen: true }))}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mb-6">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Knowledge Graphs
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Transform your research with AI-powered knowledge graphs that reveal hidden connections in your captured content.
            </p>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => router.push('/knowledge-graph/create')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Graph
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-purple-100 hover:border-purple-200 transition-colors">
              <CardContent className="p-6 text-center">
                <Network className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">AI-Powered Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Automatically discover relationships between people, places, and concepts in your captured content.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Visual Exploration</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Navigate through your research visually, zoom into clusters, and explore connection paths.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100 hover:border-green-200 transition-colors">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Professional Export</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Export beautiful graphs for presentations, reports, and sharing with your team.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphs Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Your Knowledge Graphs</h2>
              <Button 
                variant="outline"
                onClick={() => router.push('/knowledge-graph/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Graph
              </Button>
            </div>

            {state.isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : state.graphs.length === 0 ? (
              /* Empty State */
              <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
                    <Network className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    No Knowledge Graphs Yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Create your first knowledge graph to start discovering hidden connections in your research data.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0"
                    onClick={() => router.push('/knowledge-graph/create')}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Graph
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Graphs Grid - For future implementation */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.graphs.map((graph) => (
                  <Card key={graph.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="h-32 bg-gradient-to-br from-slate-100 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                        <Network className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{graph.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                        <span>{graph.nodeCount} nodes</span>
                        <span>{graph.folderCount} folders</span>
                      </div>
                      <p className="text-xs text-slate-400">Updated {graph.lastUpdated}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Getting Started */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Getting Started with Knowledge Graphs
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Knowledge graphs help you visualize connections between entities in your research. 
                    Select folders containing related content, and our AI will analyze the text to create meaningful connections.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Users className="mr-1 h-3 w-3" />
                      People & Organizations
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <FolderOpen className="mr-1 h-3 w-3" />
                      Topics & Concepts
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Trends & Patterns
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={state.isProfileModalOpen}
        onClose={() => setState(prev => ({ ...prev, isProfileModalOpen: false }))}
        user={{
          id: state.user?.id || '',
          email: state.user?.email || '',
          created_at: state.user?.created_at
        }}
        subscriptionData={{
          subscriptionTier: state.subscriptionTier,
          subscriptionStatus: state.subscriptionStatus,
          clipsThisMonth: state.clipsThisMonth,
          clipsLimit: state.clipsLimit
        }}
      />

      <BillingModal
        isOpen={state.isBillingModalOpen}
        onClose={() => setState(prev => ({ ...prev, isBillingModalOpen: false }))}
        user={{
          id: state.user?.id || '',
          email: state.user?.email || ''
        }}
        subscriptionData={{
          subscriptionTier: state.subscriptionTier,
          subscriptionStatus: state.subscriptionStatus,
          clipsThisMonth: state.clipsThisMonth,
          clipsLimit: state.clipsLimit
        }}
      />
    </div>
  )
}

export default function KnowledgeGraphDashboardPage() {
  return (
    <ProtectedRoute>
      <KnowledgeGraphDashboardContent />
    </ProtectedRoute>
  )
}
