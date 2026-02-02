'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  ChevronRight,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Check
} from 'lucide-react';

const settingsSections = [
  {
    icon: Settings,
    title: 'General',
    description: 'Basic application settings and preferences',
    color: 'var(--gray-600)',
    bgColor: 'var(--gray-100)',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure how you receive notifications',
    color: 'var(--info)',
    bgColor: 'var(--info-light)',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Password, 2FA, and security settings',
    color: 'var(--success)',
    bgColor: 'var(--success-light)',
  },
  {
    icon: CreditCard,
    title: 'Billing',
    description: 'Manage subscription and payment methods',
    color: 'var(--warning)',
    bgColor: 'var(--warning-light)',
  },
  {
    icon: Users,
    title: 'Team',
    description: 'Manage team members and permissions',
    color: 'var(--gezma-red)',
    bgColor: 'var(--gezma-red-light)',
  },
  {
    icon: Globe,
    title: 'Language & Region',
    description: 'Set your preferred language and timezone',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application settings and preferences"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Settings Menu */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--gray-100)]">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.title}
                      className="w-full flex items-center gap-4 p-5 hover:bg-[var(--gray-50)] transition-colors text-left group"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: section.bgColor }}
                      >
                        <Icon className="h-6 w-6" style={{ color: section.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--charcoal)] group-hover:text-[var(--gezma-red)] transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-[var(--gray-500)]">{section.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[var(--gray-400)] group-hover:text-[var(--gezma-red)] group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Settings */}
        <div className="space-y-4">
          {/* Theme Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--gray-500)]" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-[var(--gezma-red)] bg-[var(--gezma-red-50)]">
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-[var(--warning)]" />
                  <span className="font-medium text-[var(--charcoal)]">Light Mode</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-[var(--gezma-red)] flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--gray-200)] hover:border-[var(--gray-300)] transition-colors">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-[var(--gray-600)]" />
                  <span className="font-medium text-[var(--charcoal)]">Dark Mode</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--gray-500)]" />
                Quick Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[var(--gray-500)]" />
                  <span className="text-sm text-[var(--charcoal)]">Email alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[var(--gray-200)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--gezma-red-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--gray-300)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gezma-red)]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-[var(--gray-500)]" />
                  <span className="text-sm text-[var(--charcoal)]">Push notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[var(--gray-200)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--gezma-red-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--gray-300)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gezma-red)]"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-gradient-to-br from-[var(--charcoal)] to-[var(--gray-800)] text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-lg font-bold">BT</span>
                </div>
                <div>
                  <p className="font-semibold">Barokah Travel</p>
                  <p className="text-sm text-white/60">Professional Plan</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Storage used</span>
                  <span className="font-medium">2.4 GB / 10 GB</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[24%] bg-gradient-to-r from-[var(--gezma-red)] to-[#F87171] rounded-full" />
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10 hover:text-white">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
