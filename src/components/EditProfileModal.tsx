'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';

interface UserProfile {
  name: string | null;
  username: string | null;
  email: string | null;
  bio: string | null;
  learningGoal: string | null;
  preferredLang: string | null;
  timezone: string | null;
  avatarId: number;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaved: (updated: UserProfile) => void;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' },
];

const TIMEZONES = Intl.supportedValuesOf?.('timeZone') || [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
];

const LEARNING_GOALS = [
  { value: 'basic', label: 'Learn basic signs' },
  { value: 'conversational', label: 'Become conversational' },
  { value: 'fluent', label: 'Achieve fluency' },
  { value: 'teaching', label: 'Teach others' },
  { value: 'personal', label: 'Personal interest' },
];

export default function EditProfileModal({ open, onClose, profile, onSaved }: EditProfileModalProps) {
  const [form, setForm] = useState<UserProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (open) {
      setForm(profile);
      setStatus('idle');
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('saving');

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          bio: form.bio,
          learningGoal: form.learningGoal,
          preferredLang: form.preferredLang,
          timezone: form.timezone,
          avatarId: form.avatarId,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setStatus('success');
      onSaved(form);
      setTimeout(() => { onClose(); setStatus('idle'); }, 1200);
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#ECE8FF]">
              <h2 className="text-xl font-bold text-[#2D1B69]">Edit Profile</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-[#7E7A93]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Display Name */}
              <Field label="Display Name">
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7FF] border border-[#ECE8FF] rounded-xl text-sm text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
                  placeholder="Your name"
                />
              </Field>

              {/* Username */}
              <Field label="Username">
                <input
                  type="text"
                  value={form.username || ''}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7FF] border border-[#ECE8FF] rounded-xl text-sm text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
                  placeholder="Choose a username"
                />
              </Field>

              {/* Email (read-only) */}
              <Field label="Email">
                <input
                  type="email"
                  value={profile.email || ''}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border border-[#ECE8FF] rounded-xl text-sm text-[#7E7A93] cursor-not-allowed"
                />
                <p className="text-xs text-[#7E7A93] mt-1">Email is managed through your Clerk account</p>
              </Field>

              {/* Bio */}
              <Field label="Bio">
                <textarea
                  value={form.bio || ''}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#FAF7FF] border border-[#ECE8FF] rounded-xl text-sm text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF] resize-none"
                  placeholder="Tell us about yourself"
                />
              </Field>

              {/* Learning Goal */}
              <Field label="Learning Goal">
                <select
                  value={form.learningGoal || ''}
                  onChange={(e) => setForm((p) => ({ ...p, learningGoal: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7FF] border border-[#ECE8FF] rounded-xl text-sm text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
                >
                  <option value="">Select a goal</option>
                  {LEARNING_GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </Field>

              {/* Preferred Language */}
              <Field label="Preferred Language">
                <select
                  value={form.preferredLang || 'en'}
                  onChange={(e) => setForm((p) => ({ ...p, preferredLang: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7FF] border border-[#ECE8FF] rounded-xl text-sm text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </Field>

              {/* Timezone */}
              <Field label="Timezone">
                <select
                  value={form.timezone || 'UTC'}
                  onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#FAF7FF] border border-[#ECE8FF] rounded-xl text-sm text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </Field>

              {/* Status message */}
              {status === 'success' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Profile updated successfully!
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Failed to update profile. Please try again.
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2D1B69] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
