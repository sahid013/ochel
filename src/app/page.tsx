import { DemoMenuEditor } from '@/components/demo/DemoMenuEditor';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="text-2xl font-bold text-gray-900 font-forum">
              Ochel
            </a>

            {/* Login/Signup Buttons */}
            <div className="flex gap-3">
              <a
                href="/login"
                className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Login
              </a>
              <a
                href="/signup"
                className="px-6 py-2 bg-[#F34A23] text-white font-medium rounded-lg hover:bg-[#d63d1a] transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Demo Menu Editor */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-[60px] pb-12">
        <DemoMenuEditor />
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Ochel?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F34A23] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Create and publish your menu in minutes, not hours</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#F34A23] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fully Customizable</h3>
              <p className="text-gray-600">Choose from beautiful templates and customize colors</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#F34A23] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">Perfect viewing experience on all devices</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your Menu?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of restaurants using Ochel
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-4 bg-[#F34A23] text-white font-semibold text-lg rounded-lg hover:bg-[#d63d1a] transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </div>
  );
}
