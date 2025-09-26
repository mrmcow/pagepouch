'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Search, 
  Network, 
  FileText, 
  Users, 
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react'

interface KnowledgeGraphUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KnowledgeGraphUpgradeModal({ isOpen, onClose }: KnowledgeGraphUpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan === 'monthly' ? 'price_1SBSLeDFfW8f5SmSgQooVxsd' : 'price_1SBSNpDFfW8f5SmShv3v8v8Q',
          plan: plan
        }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Unlock Knowledge Graph
            </DialogTitle>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Transform your research with AI-powered knowledge graphs that reveal hidden connections in your captured content.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Preview Section */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">See Your Research Come to Life</h3>
            
            {/* Mock Graph Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-700">Trump Investigation Graph</h4>
                <Badge className="bg-purple-100 text-purple-700">24 connections found</Badge>
              </div>
              
              {/* Simple graph visualization mockup */}
              <div className="relative h-48 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Central node */}
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    Trump
                  </div>
                  
                  {/* Connected nodes */}
                  <div className="absolute top-8 left-16 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                    NPR
                  </div>
                  <div className="absolute top-8 right-16 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                    ICE
                  </div>
                  <div className="absolute bottom-8 left-20 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                    Policy
                  </div>
                  <div className="absolute bottom-8 right-20 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                    BBC
                  </div>
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                    <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                    <line x1="50%" y1="50%" x2="70%" y2="75%" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                  </svg>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">Interactive graph showing connections between entities in your research</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-purple-100">
              <CardContent className="p-6 text-center">
                <Network className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-800 mb-2">AI-Powered Analysis</h4>
                <p className="text-sm text-slate-600">Automatically discover relationships between people, places, and concepts in your captured content.</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-100">
              <CardContent className="p-6 text-center">
                <Search className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-800 mb-2">Visual Exploration</h4>
                <p className="text-sm text-slate-600">Navigate through your research visually, zoom into clusters, and explore connection paths.</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-slate-800 mb-2">Professional Export</h4>
                <p className="text-sm text-slate-600">Export beautiful graphs for presentations, reports, and sharing with your team.</p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Upgrade to PagePouch Pro</h3>
              <p className="text-slate-600">Get Knowledge Graph + all Pro features</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Monthly Plan */}
              <Card className="border-slate-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-slate-800">Monthly</h4>
                    <div className="text-3xl font-bold text-slate-800 mt-2">$4<span className="text-lg text-slate-500">/month</span></div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Knowledge Graph access
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      1,000 clips/month
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      5GB storage
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpgrade('monthly')}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? 'Processing...' : 'Start Monthly Plan'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Annual Plan */}
              <Card className="border-green-300 bg-green-50/50 relative">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  Save $8/year
                </Badge>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-slate-800">Annual</h4>
                    <div className="text-3xl font-bold text-slate-800 mt-2">$40<span className="text-lg text-slate-500">/year</span></div>
                    <p className="text-sm text-green-600">$3.33/month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Knowledge Graph access
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      1,000 clips/month
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      5GB storage
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => handleUpgrade('annual')}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? 'Processing...' : 'Start Annual Plan'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                30-day money-back guarantee • Cancel anytime • Secure payment by Stripe
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
