import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
          <span className="text-white text-2xl font-bold">Z</span>
        </div>
        <h1 className="text-6xl font-bold text-pink-500 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard">
          <a className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300">
            Go Home
          </a>
        </Link>
        <p className="mt-6 text-xs text-gray-400 font-medium">Stronger With Zoe</p>
      </div>
    </div>
  );
}
