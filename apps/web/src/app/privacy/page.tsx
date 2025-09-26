'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, Users, Clock } from 'lucide-react'
import { LogoIcon } from '@/components/ui/logo'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="pagepouch-container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <LogoIcon size={32} />
              <span className="text-xl font-bold">PagePouch</span>
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pagepouch-container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your privacy is our priority. Learn how we collect, use, and protect your data with complete transparency.
            </p>
            <div className="mt-6 text-sm text-slate-500">
              <span>Last updated: January 15, 2025</span>
            </div>
          </div>

          {/* Quick Overview */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-3xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Privacy at a Glance</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">What We Collect</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Only what's necessary: account info, captured content, and usage analytics.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How We Protect It</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Enterprise-grade encryption, secure servers, and regular security audits.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Where It's Stored</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Secure data centers in the US and EU, with GDPR compliance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Who Can Access It</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Only you and authorized PagePouch staff for support purposes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Account Information</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
                <li>• Email address (for account creation and communication)</li>
                <li>• Name (optional, for personalization)</li>
                <li>• Password (encrypted and never stored in plain text)</li>
                <li>• Subscription and billing information (processed by Stripe)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Captured Content</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
                <li>• Web page screenshots and HTML content you choose to save</li>
                <li>• URLs and metadata of captured pages</li>
                <li>• Your notes, tags, and folder organization</li>
                <li>• Search queries within your captured content</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Usage Analytics</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• Feature usage patterns (to improve our service)</li>
                <li>• Performance metrics (page load times, error rates)</li>
                <li>• Device and browser information (for compatibility)</li>
                <li>• IP address and general location (for security and compliance)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">2. How We Use Your Information</h2>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Primary Purposes</h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• Provide and maintain the PagePouch service</li>
                  <li>• Store and organize your captured web content</li>
                  <li>• Enable search and retrieval of your saved content</li>
                  <li>• Process payments and manage subscriptions</li>
                  <li>• Provide customer support and respond to inquiries</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Secondary Purposes</h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• Improve our service through usage analytics</li>
                  <li>• Send important service updates and security notifications</li>
                  <li>• Detect and prevent fraud or abuse</li>
                  <li>• Comply with legal obligations and law enforcement requests</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">3. Data Security & Protection</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                  <Lock className="h-8 w-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Encryption</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your content is protected with enterprise-grade security.
                  </p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                  <Database className="h-8 w-8 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Secure Storage</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Data is stored in SOC 2 compliant data centers with 24/7 monitoring, regular backups, and disaster recovery.
                  </p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                  <Shield className="h-8 w-8 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Access Control</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Strict access controls ensure only authorized personnel can access systems, with all access logged and monitored.
                  </p>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                  <Globe className="h-8 w-8 text-orange-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Compliance</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    We comply with GDPR, CCPA, and other privacy regulations, with regular audits and security assessments.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">4. Your Rights & Choices</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">Under GDPR, you have the right to:</h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li>• <strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                  <li>• <strong>Rectification:</strong> Correct any inaccurate or incomplete data</li>
                  <li>• <strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                  <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li>• <strong>Restriction:</strong> Limit how we process your personal data</li>
                  <li>• <strong>Objection:</strong> Object to processing based on legitimate interests</li>
                </ul>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4">
                To exercise any of these rights, contact us at <a href="mailto:privacy@pagepouch.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@pagepouch.com</a>. 
                We'll respond within 30 days and may require identity verification.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">5. Data Sharing & Third Parties</h2>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">We DO NOT sell your data</h3>
                <p className="text-red-700 dark:text-red-300">
                  PagePouch will never sell, rent, or trade your personal information or captured content to third parties for marketing purposes.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Limited Sharing</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">We only share data with:</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• <strong>Service Providers:</strong> Stripe (payments), Supabase (hosting), Vercel (infrastructure)</li>
                <li>• <strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights</li>
                <li>• <strong>Business Transfer:</strong> In case of merger or acquisition (with notice to users)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">6. Data Retention</h2>
              
              <div className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                <Clock className="h-6 w-6 text-slate-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Retention Periods</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li>• <strong>Active Accounts:</strong> Data retained while your account is active</li>
                    <li>• <strong>Deleted Accounts:</strong> Data permanently deleted within 30 days</li>
                    <li>• <strong>Billing Records:</strong> Kept for 7 years for tax and legal compliance</li>
                    <li>• <strong>Analytics Data:</strong> Anonymized and retained for up to 2 years</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">7. Contact & Updates</h2>
              
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Questions or Concerns?</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p>📧 Email: <a href="mailto:privacy@pagepouch.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@pagepouch.com</a></p>
                  <p>🌐 Web: <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">pagepouch.com/contact</Link></p>
                  <p>📍 Address: PagePouch Inc., 123 Privacy Lane, San Francisco, CA 94105</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500">
                    <strong>Policy Updates:</strong> We may update this Privacy Policy occasionally. 
                    Material changes will be communicated via email and posted on our website 30 days before taking effect.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}
