'use client';

interface ComingSoonTemplateProps {
  restaurantName: string;
  templateName: string;
  templateDescription: string;
}

export default function ComingSoonTemplate({
  restaurantName,
  templateName,
  templateDescription
}: ComingSoonTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg">
            <span className="text-5xl">
              {templateName === 'Modern Light' && '☀️'}
              {templateName === 'Boutique' && '✨'}
              {templateName === 'Casual Dining' && '🍔'}
            </span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {restaurantName}
        </h1>

        <div className="inline-block bg-[#F34A23] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
          {templateName} Template
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Coming Soon
        </h2>

        <p className="text-xl text-gray-600 mb-8">
          {templateDescription}
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-700 mb-4">
            This template is currently under development. Our team is working hard to bring you this beautiful design.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Expected launch: Coming soon</span>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-gray-600">
            In the meantime, you can switch back to our Classic Dark template from the admin panel.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/"
              className="inline-block bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">🎨</div>
            <p className="text-sm text-gray-600">Custom Design</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm text-gray-600">Mobile Optimized</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm text-gray-600">Fast Loading</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm text-gray-600">Modern UI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
