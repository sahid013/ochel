import { DemoMenuEditor } from '@/components/demo/DemoMenuEditor';
import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';
import AnimateIn from '@/components/ui/AnimateIn';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
      <Navbar />

      {/* Hero Section - Demo Menu Editor */}
      <div className="h-fit pt-[60px] pb-12" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
        <AnimateIn animation="fade" duration={800}>
          <DemoMenuEditor />
        </AnimateIn>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
        <div className="max-w-[1460px] mx-auto">
          <AnimateIn animation="slide" delay={200}>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12 font-loubag uppercase">
              Why Choose Ochel?
            </h2>
          </AnimateIn>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimateIn animation="slide" delay={300} className="text-center">
              <div className="w-16 h-16 bg-[#F34A23] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2 font-plus-jakarta-sans">Lightning Fast</h3>
              <p className="text-secondary font-plus-jakarta-sans">Create and publish your menu in minutes, not hours</p>
            </AnimateIn>

            <AnimateIn animation="slide" delay={500} className="text-center">
              <div className="w-16 h-16 bg-[#F34A23] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2 font-plus-jakarta-sans">Fully Customizable</h3>
              <p className="text-secondary font-plus-jakarta-sans">Choose from beautiful templates and customize colors</p>
            </AnimateIn>

            <AnimateIn animation="slide" delay={700} className="text-center">
              <div className="w-16 h-16 bg-[#F34A23] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2 font-plus-jakarta-sans">Mobile Optimized</h3>
              <p className="text-secondary font-plus-jakarta-sans">Perfect viewing experience on all devices</p>
            </AnimateIn>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 text-white relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80")' }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/85"></div>

        <div className="max-w-[1460px] mx-auto text-center relative z-10">
          <AnimateIn animation="blur" duration={1000}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-loubag uppercase">
              Ready to Create Your Menu?
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter">
              Join thousands of restaurants using Ochel
            </p>
            <PrimaryButton href="/signup" className="inline-block px-8 py-4 text-lg">
              Sign up
            </PrimaryButton>
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}
