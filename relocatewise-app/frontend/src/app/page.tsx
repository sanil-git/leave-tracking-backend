import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>RelocateWise</title>
        <meta name="description" content="Plan your move or weekend trip with smart checklists, suggestions, and memories." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

        <main className="min-h-screen bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  <span className="inline-block animate-pulse">R</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.1s'}}>e</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.2s'}}>l</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.3s'}}>o</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.4s'}}>c</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.5s'}}>a</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.6s'}}>t</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.7s'}}>e</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.8s'}}>W</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.9s'}}>i</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '1.0s'}}>s</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '1.1s'}}>e</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/login" className="text-white hover:text-gray-200 font-medium">
                  Sign In
                </a>
                <a href="/select-city" className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Welcome to your
                  <span className="block text-white">relocation community</span>
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Plan your move with confidence. Get personalized checklists, city insights, and connect with others who've made the same journey.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/select-city"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Continue as Guest
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:border-white/50 hover:bg-white/10 transition-all duration-200"
                >
                  Sign in to your account
                </a>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Smart Checklists</h3>
                  <p className="text-sm text-white/80">Personalized tasks</p>
                </div>
                
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Photo Logs</h3>
                  <p className="text-sm text-white/80">Document memories</p>
                </div>
                
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">City Tips</h3>
                  <p className="text-sm text-white/80">Local insights</p>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Mock Dashboard Preview */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Moving to Mumbai</h3>
                      <p className="text-sm text-gray-600">45 days remaining</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">🏏</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="text-sm font-medium">Book movers</span>
                      </div>
                      <span className="text-xs text-gray-500">Done</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">⏳</span>
                        </div>
                        <span className="text-sm font-medium">Update address</span>
                      </div>
                      <span className="text-xs text-yellow-600">Pending</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">○</span>
                        </div>
                        <span className="text-sm font-medium">Pack essentials</span>
                      </div>
                      <span className="text-xs text-gray-500">Not started</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>33%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '33%'}}></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm">⭐</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-white/10 backdrop-blur-sm py-16 border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to make your move?</h3>
              <p className="text-lg text-white/90 mb-8">Join thousands of people who've successfully relocated with RelocateWise</p>
              <a
                href="/select-city"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Planning Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}