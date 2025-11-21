'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileDown, 
  Clock, 
  Book, 
  FileText, 
  Table, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  X,
  GraduationCap,
  Search as SearchIcon,
  TrendingUp
} from 'lucide-react'

interface ExportUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportUpgradeModal({ isOpen, onClose }: ExportUpgradeModalProps) {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
              <FileDown className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Unlock Professional Export
            </DialogTitle>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Save hours on citations, reports, and data analysis. Export your research in any format with one click.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Time Savings Hero */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <Badge className="bg-blue-600 text-white mb-4">Proven Time Saver</Badge>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">From 3 Hours to 5 Minutes</h3>
              <p className="text-slate-600">PhD students save 14+ hours per dissertation. OSINT analysts save 10+ hours per report.</p>
            </div>
            
            {/* Export Formats Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg border border-blue-200">
                  <Book className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-slate-800">APA/MLA/Chicago</div>
                  <div className="text-xs text-slate-600 mt-1">Perfect citations</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/30 rounded-lg border border-green-200">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-slate-800">Markdown</div>
                  <div className="text-xs text-slate-600 mt-1">For Obsidian</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-lg border border-purple-200">
                  <Table className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-slate-800">CSV/Excel</div>
                  <div className="text-xs text-slate-600 mt-1">Data analysis</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-lg border border-orange-200">
                  <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-slate-800">HTML/PDF</div>
                  <div className="text-xs text-slate-600 mt-1">Beautiful reports</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium opacity-90">Example: Export 50 Citations</div>
                    <div className="text-2xl font-bold">⏱️ 3 hours → 5 minutes</div>
                  </div>
                  <div className="text-4xl font-bold">97%</div>
                </div>
                <div className="text-sm mt-2 opacity-90">Time saved per research task</div>
              </div>
            </div>
          </div>

          {/* Use Cases Grid */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Perfect For</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-blue-100">
                <CardContent className="p-6">
                  <GraduationCap className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-slate-800 mb-2">PhD Students</h4>
                  <p className="text-sm text-slate-600 mb-3">Export 50 papers as perfect APA citations in 5 minutes. Save 14+ hours per dissertation.</p>
                  <div className="text-xs text-blue-600 font-medium">→ APA, MLA, Chicago formats</div>
                </CardContent>
              </Card>
              
              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <SearchIcon className="h-8 w-8 text-purple-600 mb-3" />
                  <h4 className="font-semibold text-slate-800 mb-2">OSINT Analysts</h4>
                  <p className="text-sm text-slate-600 mb-3">Generate timeline reports with all screenshots and timestamps automatically. Save 2 hours per report.</p>
                  <div className="text-xs text-purple-600 font-medium">→ PDF, Markdown, HTML exports</div>
                </CardContent>
              </Card>
              
              <Card className="border-green-100">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-slate-800 mb-2">Market Researchers</h4>
                  <p className="text-sm text-slate-600 mb-3">Export competitor data to Excel for analysis. Build comparison tables in minutes, not hours.</p>
                  <div className="text-xs text-green-600 font-medium">→ CSV, JSON, Excel formats</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Everything Included</h3>
            <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-slate-700">7 export formats (APA, MLA, Chicago, Markdown, CSV, JSON, HTML)</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-slate-700">Bulk export - select multiple clips at once</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-slate-700">Auto-formatted citations (no manual work)</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-slate-700">Include screenshots, notes, and metadata</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-slate-700">Flexible sorting (date, title, alphabetical)</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-slate-700">Instant download - no waiting</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white rounded-xl border-2 border-blue-100 p-6 text-center">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-lg italic text-slate-700 mb-3">
              "This single feature saved me 14 hours on my dissertation. Worth every penny."
            </p>
            <p className="text-sm text-slate-500">— PhD Candidate, Psychology</p>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Upgrade to PageStash Pro</h3>
              <p className="text-slate-600">Get Export + Knowledge Graphs + all Pro features</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Monthly Plan */}
              <Card className="border-slate-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-slate-800">Monthly</h4>
                    <div className="text-3xl font-bold text-slate-800 mt-2">$12<span className="text-lg text-slate-500">/month</span></div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <strong>Export feature</strong> (all formats)
                    </li>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
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
                  Save $24/year
                </Badge>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-slate-800">Annual</h4>
                    <div className="text-3xl font-bold text-slate-800 mt-2">$120<span className="text-lg text-slate-500">/year</span></div>
                    <p className="text-sm text-green-600">$10/month</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <strong>Export feature</strong> (all formats)
                    </li>
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

          {/* ROI Calculator */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <h3 className="text-xl font-bold mb-2">ROI: 3,600%</h3>
            <p className="text-blue-100 mb-4">
              If you save just 2 hours per month at $25/hour, this feature pays for itself 4x over.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">2h</div>
                <div className="text-xs text-blue-100">Saved per task</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">14h</div>
                <div className="text-xs text-blue-100">Saved per paper</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">$350</div>
                <div className="text-xs text-blue-100">Value per year</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

