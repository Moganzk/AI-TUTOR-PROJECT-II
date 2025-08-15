import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';

const NotificationsPreferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    push_enabled: true,
    digest_enabled: false,
    digest_frequency: 'daily'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiService.notifications.preferencesGet();
        if (data.preferences) setPrefs({ ...prefs, ...data.preferences });
      } catch (e) {
        console.error('Failed to load preferences', e);
        toast.error('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPrefs(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.notifications.preferencesUpdate(prefs);
      toast.success('Preferences saved');
    } catch (e) {
      console.error('Save failed', e);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading preferences...</div>;

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Notification Preferences</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="email_enabled" checked={prefs.email_enabled} onChange={handleChange} />
          <span>Email Notifications</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="push_enabled" checked={prefs.push_enabled} onChange={handleChange} />
          <span>In-App Notifications</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="digest_enabled" checked={prefs.digest_enabled} onChange={handleChange} />
          <span>Digest Email</span>
        </label>
        {prefs.digest_enabled && (
          <div>
            <label className="block mb-1 text-sm font-medium">Digest Frequency</label>
            <select name="digest_frequency" value={prefs.digest_frequency} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        )}
        <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save Preferences'}</button>
      </form>
    </div>
  );
};

export default NotificationsPreferences;
