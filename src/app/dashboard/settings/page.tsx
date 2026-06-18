'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Head from 'next/head';
import {
  Bell, Volume2, Eye, Shield, Monitor, Palette, Accessibility,
  Smartphone, Mail, Camera, Moon, Sun, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';

interface UserSettings {
  soundEffects: boolean;
  achievementSounds: boolean;
  streakReminders: boolean;
  emailNotifications: boolean;
  emailAchievements: boolean;
  emailStreaks: boolean;
  emailWeeklyReport: boolean;
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontScale: number;
  showLeaderboard: boolean;
  showActivity: boolean;
  profileVisibility: string;
  defaultCamera: string | null;
}

const defaultSettings: UserSettings = {
  soundEffects: true,
  achievementSounds: true,
  streakReminders: true,
  emailNotifications: true,
  emailAchievements: true,
  emailStreaks: true,
  emailWeeklyReport: false,
  darkMode: false,
  highContrast: false,
  reducedMotion: false,
  fontScale: 100,
  showLeaderboard: true,
  showActivity: true,
  profileVisibility: 'public',
  defaultCamera: null,
};

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaving(key);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {}
    setSaving(null);
  };

  const sections = [
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notification Preferences',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your progress' },
        { key: 'emailAchievements', label: 'Achievement Emails', description: 'Get notified when you unlock new achievements' },
        { key: 'emailStreaks', label: 'Streak Reminder Emails', description: 'Remind you to keep your streak alive' },
        { key: 'emailWeeklyReport', label: 'Weekly Report', description: 'Receive a weekly summary of your activity' },
      ],
    },
    {
      id: 'sound',
      icon: Volume2,
      title: 'Sound Preferences',
      items: [
        { key: 'soundEffects', label: 'Sound Effects', description: 'Play sounds for correct/incorrect answers' },
        { key: 'achievementSounds', label: 'Achievement Sounds', description: 'Play a sound when you unlock an achievement' },
        { key: 'streakReminders', label: 'Streak Reminders', description: 'Play a sound for streak milestones' },
      ],
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy Settings',
      items: [
        { key: 'showLeaderboard', label: 'Show on Leaderboard', description: 'Display your name and score on public leaderboards' },
        { key: 'showActivity', label: 'Share Activity', description: 'Let others see your learning activity' },
        {
          key: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Control who can view your profile',
          type: 'select',
          options: [
            { value: 'public', label: 'Public' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'private', label: 'Private' },
          ],
        },
      ],
    },
    {
      id: 'camera',
      icon: Camera,
      title: 'Camera Preferences',
      items: [
        { key: 'defaultCamera', label: 'Default Camera', description: 'Select which camera to use for practice', type: 'text' },
      ],
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      title: 'Accessibility',
      items: [
        { key: 'highContrast', label: 'High Contrast', description: 'Increase contrast for better visibility' },
        { key: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations throughout the app' },
        {
          key: 'fontScale',
          label: 'Font Scaling',
          description: 'Adjust text size',
          type: 'range',
          min: 75,
          max: 150,
          step: 5,
          suffix: '%',
        },
      ],
    },
    {
      id: 'appearance',
      icon: Palette,
      title: 'Theme Preferences',
      items: [
        { key: 'darkMode', label: 'Dark Mode', description: 'Switch between light and dark themes' },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>Sanjog - Settings</title>
      </Head>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/profile" className="text-[#7E7A93] hover:text-[#7D54FF] p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2D1B69]">Settings</h1>
            <p className="text-sm text-[#7E7A93]">Manage your preferences and account settings</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-[#ECE8FF]">
                <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 rounded-lg" />
                  <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#ECE8FF] p-6 shadow-[0_8px_24px_rgba(125,84,255,0.06)]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#EAE4FF] flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-[#7D54FF]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#2D1B69]">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <SettingsRow
                      key={item.key}
                      label={item.label}
                      description={item.description}
                      type={(item as any).type || 'toggle'}
                      value={settings[item.key as keyof UserSettings] as any}
                      options={(item as any).options}
                      min={(item as any).min}
                      max={(item as any).max}
                      step={(item as any).step}
                      suffix={(item as any).suffix}
                      saving={saving === item.key}
                      onChange={(val) => updateSetting(item.key as keyof UserSettings, val)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SettingsRow({
  label, description, type, value, options, min, max, step, suffix, saving, onChange,
}: {
  label: string; description: string; type: string; value: any;
  options?: { value: string; label: string }[];
  min?: number; max?: number; step?: number; suffix?: string;
  saving?: boolean; onChange: (val: any) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-[#FAF7FF] rounded-xl">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#2D1B69]">{label}</span>
          {saving && <span className="w-2 h-2 rounded-full bg-[#7D54FF] animate-pulse" />}
        </div>
        <p className="text-xs text-[#7E7A93] mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {type === 'toggle' && (
          <button
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              value ? 'bg-[#7D54FF]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                value ? 'translate-x-[22px]' : 'translate-x-0.5'
              } mt-[2px]`}
            />
          </button>
        )}
        {type === 'select' && options && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm bg-white border border-[#ECE8FF] rounded-lg px-3 py-1.5 text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {type === 'range' && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-24 h-1.5 bg-[#EAE4FF] rounded-full appearance-none cursor-pointer accent-[#7D54FF]"
            />
            <span className="text-sm font-medium text-[#2D1B69] w-12 text-right">{value}{suffix}</span>
          </div>
        )}
        {type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Auto-detect"
            className="text-sm bg-white border border-[#ECE8FF] rounded-lg px-3 py-1.5 w-32 text-[#2D1B69] focus:outline-none focus:ring-2 focus:ring-[#7D54FF]"
          />
        )}
      </div>
    </div>
  );
}
