export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[8rem] md:text-[12rem] font-bold text-gray-900 font-forum mb-8">
          Ochel
        </h1>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-8 py-3 bg-[#F34A23] text-white font-medium rounded-lg hover:bg-[#d63d1a] transition-colors"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
