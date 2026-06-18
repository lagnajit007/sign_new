import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/sign-in" className="text-[#7D54FF] text-sm hover:underline mb-8 inline-block">&larr; Back</Link>
        <h1 className="text-3xl font-bold text-[#2D1B69] mb-6">Terms of Service</h1>
        <div className="bg-white rounded-2xl p-8 space-y-4 text-[#7E7A93] text-sm leading-relaxed">
          <p>By using Sanjog, you agree to these terms. Please read them carefully.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">1. Use of Service</h2>
          <p>Sanjog provides an AI-powered sign language learning platform. You may use it for personal, non-commercial educational purposes only.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">3. Prohibited Conduct</h2>
          <p>You may not misuse the platform, including attempting to bypass recognition algorithms, scrape data, or disrupt service operations.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">4. Limitation of Liability</h2>
          <p>Sanjog is provided &ldquo;as is&rdquo; without warranties. We are not liable for damages arising from your use of the platform.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">5. Changes</h2>
          <p>We may update these terms. Continued use after changes constitutes acceptance of the new terms.</p>
        </div>
      </div>
    </div>
  );
}
