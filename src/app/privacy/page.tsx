import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/sign-in" className="text-[#7D54FF] text-sm hover:underline mb-8 inline-block">&larr; Back</Link>
        <h1 className="text-3xl font-bold text-[#2D1B69] mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-2xl p-8 space-y-4 text-[#7E7A93] text-sm leading-relaxed">
          <p>Your privacy matters to us. This policy explains how Sanjog handles your data.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">1. Information We Collect</h2>
          <p>We collect account information (name, email), learning progress data (sign attempts, accuracy, XP), and camera feed data (processed in real-time for gesture recognition — never stored or transmitted).</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">2. How We Use Data</h2>
          <p>Your data is used to personalize learning, track progress, and improve our AI recognition models. Camera data is processed locally and never leaves your device.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">3. Data Sharing</h2>
          <p>We do not sell your data. Aggregated, anonymized statistics may be shared for research purposes.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">4. Your Rights</h2>
          <p>You may request access, correction, or deletion of your data at any time by contacting us.</p>
          <h2 className="text-lg font-semibold text-[#2D1B69]">5. Security</h2>
          <p>We implement industry-standard security measures including encryption in transit and at rest.</p>
        </div>
      </div>
    </div>
  );
}
