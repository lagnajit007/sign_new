import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-md">
        <div className="text-[#7D54FF] text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-[#7D54FF] text-white rounded-md hover:bg-[#6840E0] transition-colors inline-block"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}

// This setting allows Next.js to generate this page without requiring authentication
export const dynamic = 'force-static';
export const generateStaticParams = async () => {
  return [];
};
// Disable data revalidation
export const revalidate = false; 