'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { LogoIcon } from '@/components/ui/logo'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="pagestash-container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <LogoIcon size={32} />
              <span className="text-xl font-bold">PageStash</span>
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
      <main className="pagestash-container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Clear, fair terms that protect both you and PageStash. Read what you're agreeing to when you use our service.
            </p>
            <div className="mt-6 text-sm text-slate-500">
              <span>Last updated: January 15, 2025</span>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-3xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Terms Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">What You Can Do</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Use PageStash for personal or commercial research, capture unlimited content, and organize your data.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">What You Can't Do</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Violate copyright, abuse the service, or use it for illegal activities.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Our Responsibilities</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Provide reliable service, protect your data, and give 30 days notice for major changes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Limitations</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Service provided "as-is" with reasonable limitations on liability and damages.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Terms */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">1. Acceptance of Terms</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                By accessing or using PageStash ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                These Terms apply to all visitors, users, and others who access or use the Service, including both free and paid users.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">2. Description of Service</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                PageStash is a web archival tool that allows users to capture, store, organize, and search web content including:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
                <li>• Full-page screenshots and HTML content</li>
                <li>• URL metadata and page information</li>
                <li>• Personal notes, tags, and organizational tools</li>
                <li>• Search functionality across captured content</li>
                <li>• Browser extensions for Chrome and Firefox</li>
                <li>• Web dashboard for content management</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Account Creation</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
                <li>• You must provide accurate and complete information</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• You must be at least 13 years old to create an account</li>
                <li>• One person may not maintain multiple accounts</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Account Responsibilities</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• Keep your password secure and confidential</li>
                  <li>• Notify us immediately of any unauthorized access</li>
                  <li>• You are liable for all activities under your account</li>
                  <li>• Provide accurate billing information for paid plans</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">4. Acceptable Use Policy</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">Permitted Uses</h3>
                  <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                    <li>• Personal research and organization</li>
                    <li>• Academic and educational purposes</li>
                    <li>• Business research and analysis</li>
                    <li>• Journalism and content creation</li>
                    <li>• Legal compliance and documentation</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mb-3" />
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">Prohibited Uses</h3>
                  <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
                    <li>• Copyright infringement or piracy</li>
                    <li>• Harassment or abusive behavior</li>
                    <li>• Spam or automated abuse</li>
                    <li>• Illegal activities or content</li>
                    <li>• Reverse engineering or hacking</li>
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-3" />
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">Content Responsibility</h3>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  You are solely responsible for the content you capture and store. Ensure you have the right to archive and store any content you capture through PageStash. 
                  We reserve the right to remove content that violates these terms or applicable laws.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">5. Subscription and Billing</h2>
              
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Free and Paid Plans</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• <strong>Free Plan:</strong> 50 clips per month with basic features</li>
                  <li>• <strong>Pro Plan:</strong> 1,000 clips per month with advanced features</li>
                  <li>• <strong>Billing:</strong> Monthly or annual subscription options</li>
                  <li>• <strong>Changes:</strong> You can upgrade, downgrade, or cancel anytime</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Payment Terms</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-6">
                <li>• Payments processed securely through Stripe</li>
                <li>• Subscriptions auto-renew unless cancelled</li>
                <li>• No refunds for partial months, but you keep access until period ends</li>
                <li>• Price changes require 30 days advance notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Cancellation & Refunds</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li>• Cancel anytime from your account settings</li>
                  <li>• No cancellation fees or penalties</li>
                  <li>• Full refund within 30 days of first payment</li>
                  <li>• Pro-rated refunds for annual plans (case-by-case basis)</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Your Content</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You retain all rights to the content you capture and store in PageStash. We do not claim ownership of your captured content, 
                notes, or organizational data.
              </p>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Our Service</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                PageStash, including its software, design, and documentation, is protected by copyright, trademark, and other intellectual property laws. 
                You may not copy, modify, or distribute our service without permission.
              </p>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">License to Use</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                <p className="text-slate-600 dark:text-slate-400">
                  We grant you a limited, non-exclusive, non-transferable license to use PageStash for its intended purpose. 
                  This license terminates when you stop using the service or violate these terms.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">7. Privacy and Data</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your privacy is important to us. Please review our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Key Privacy Points</h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• We encrypt all data in transit and at rest</li>
                  <li>• We never sell your personal information</li>
                  <li>• You can export or delete your data anytime</li>
                  <li>• We comply with GDPR, CCPA, and other privacy laws</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">8. Service Availability</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                  <CheckCircle className="h-6 w-6 text-green-500 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Our Commitment</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                    <li>• 99.9% uptime target</li>
                    <li>• Regular backups and disaster recovery</li>
                    <li>• 24/7 monitoring and support</li>
                    <li>• Advance notice of maintenance</li>
                  </ul>
                </div>
                
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                  <Clock className="h-6 w-6 text-orange-500 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Service Interruptions</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                    <li>• Scheduled maintenance windows</li>
                    <li>• Emergency security updates</li>
                    <li>• Third-party service outages</li>
                    <li>• Force majeure events</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">9. Limitation of Liability</h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-6">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mb-3" />
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Service Disclaimer</h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  PageStash is provided "as-is" without warranties of any kind. We strive for reliability but cannot guarantee 
                  uninterrupted service or data integrity. Use the service at your own risk.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Liability Limits</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• Our liability is limited to the amount you paid in the last 12 months</li>
                <li>• We are not liable for indirect, incidental, or consequential damages</li>
                <li>• We are not responsible for third-party content or services</li>
                <li>• Some jurisdictions don't allow liability limitations, so these may not apply to you</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">10. Termination</h2>
              
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Your Right to Terminate</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You may terminate your account at any time by contacting us or using the account deletion feature in your dashboard.
              </p>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Our Right to Terminate</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
                <p className="text-slate-600 dark:text-slate-400 mb-3">We may suspend or terminate your account if you:</p>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• Violate these Terms of Service</li>
                  <li>• Engage in fraudulent or illegal activities</li>
                  <li>• Abuse the service or other users</li>
                  <li>• Fail to pay for premium services</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Effect of Termination</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>• Your access to the service will be immediately suspended</li>
                <li>• You have 30 days to export your data before deletion</li>
                <li>• Paid subscriptions will not be refunded (except as stated above)</li>
                <li>• These terms will continue to apply to past use of the service</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">11. Changes to Terms</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">How We Handle Updates</h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                  <li>• We may update these terms occasionally to reflect service changes</li>
                  <li>• Material changes will be communicated via email 30 days in advance</li>
                  <li>• Continued use after changes constitutes acceptance</li>
                  <li>• If you disagree with changes, you may terminate your account</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">12. Contact Information</h2>
              
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Questions About These Terms?</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p>📧 Email: <a href="mailto:legal@pagestash.com" className="text-blue-600 dark:text-blue-400 hover:underline">legal@pagestash.com</a></p>
                  <p>🌐 Web: <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">pagestash.com/contact</Link></p>
                  <p>📍 Address: PageStash Inc., 123 Privacy Lane, San Francisco, CA 94105</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500">
                    These Terms of Service are effective as of January 15, 2025, and govern your use of PageStash services.
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
