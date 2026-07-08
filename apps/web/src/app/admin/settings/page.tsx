'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, Save, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

const SETTING_TOOLTIPS: { [key: string]: string } = {
  PLATFORM_MAINTENANCE_MODE: "WARNING: Activating this will block all Investor and Broker operations, showing a global maintenance screen across the platform.",
  KYC_AUTO_APPROVAL_MOCK: "MOCK PARAMETER: When active, any uploaded KYC document will be automatically approved by the system. Ideal for sandbox testing.",
  MAX_INVESTMENT_LIMIT_GLOBAL: "THRESHOLD LIMIT: The maximum capital sizing (in MZN) allowed per individual bond subscription order."
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<{ [key: string]: boolean }>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      toast.error('Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateValue = (key: string, value: string) => {
    setSettings(prev =>
      prev.map(s => s.key === key ? { ...s, value } : s)
    );
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      setSavingKeys(prev => ({ ...prev, [key]: true }));
      await api.patch(`/admin/settings/${key}`, { value });
      toast.success(`Setting '${key}' updated successfully.`);
      fetchSettings();
    } catch (err: any) {
      console.error(`Failed to save setting ${key}:`, err);
      toast.error(err.response?.data?.message || `Failed to update ${key}.`);
    } finally {
      setSavingKeys(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1633]">Global System Configurations</h1>
          <p className="text-sm text-[#79628c] mt-1">Adjust platform variables, configure mock environments, and change operational thresholds.</p>
        </div>
        <button 
          onClick={fetchSettings}
          className="flex items-center space-x-2 px-3 py-2 border border-hairline-cool hover:bg-slate-50 rounded-lg text-xs font-semibold bg-white text-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-white rounded-xl border border-hairline-cool p-12 text-center shadow-sm text-[#79628c] space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-lg font-semibold">No Settings Discovered</p>
          <p className="text-sm">Run seed scripts to generate initial system settings parameters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {settings.map((setting) => (
            <div 
              key={setting.id || setting.key} 
              className="bg-white rounded-xl border border-hairline-cool p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <Tooltip 
                    position="top"
                    content={SETTING_TOOLTIPS[setting.key] || "System operational configuration variable."}
                  >
                    <span className="font-mono text-sm font-bold text-[#1f1633] bg-slate-100 px-2 py-0.5 rounded cursor-help">
                      {setting.key}
                    </span>
                  </Tooltip>
                </div>
                <p className="text-sm text-slate-600">{setting.description || 'No description provided.'}</p>
                {setting.updatedAt && (
                  <p className="text-[11px] text-[#79628c]">
                    Last updated: {new Date(setting.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                {setting.key === 'PLATFORM_MAINTENANCE_MODE' || setting.key === 'KYC_AUTO_APPROVAL_MOCK' ? (
                  <select
                    value={setting.value}
                    onChange={(e) => handleUpdateValue(setting.key, e.target.value)}
                    className="border border-hairline-cool px-3 py-2 rounded-lg outline-none text-sm font-medium text-ink bg-white focus:border-red-500 w-full md:w-48 transition-colors"
                  >
                    <option value="true">True (Active)</option>
                    <option value="false">False (Inactive)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleUpdateValue(setting.key, e.target.value)}
                    className="border border-hairline-cool px-3 py-2 rounded-lg outline-none text-sm font-semibold text-ink-deep focus:border-red-500 w-full md:w-64 transition-colors"
                  />
                )}
                
                <button
                  disabled={savingKeys[setting.key]}
                  onClick={() => handleSaveSetting(setting.key, setting.value)}
                  className="flex items-center justify-center space-x-1.5 bg-[#1f1633] hover:bg-[#2b1f47] text-white px-3 py-2 rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 h-[38px] shrink-0"
                >
                  {savingKeys[setting.key] ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
