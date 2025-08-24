import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Globe, Save, Eye, EyeOff } from 'lucide-react';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    avatar: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    assignmentReminders: boolean;
    quizReminders: boolean;
    courseUpdates: boolean;
    messages: boolean;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactorEnabled: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      bio: 'Computer Science student passionate about learning and technology.',
      avatar: '',
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      assignmentReminders: true,
      quizReminders: true,
      courseUpdates: true,
      messages: true,
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
    },
    preferences: {
      theme: 'auto',
      language: 'English',
      timezone: 'UTC-5 (Eastern Time)',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (section: keyof UserSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message or handle errors
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  const renderProfileTab = () => (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center gap-3">
        <div className="rounded-circle bg-primary bg-opacity-10 p-3">
          {settings.profile.avatar ? (
            <img src={settings.profile.avatar} alt="Avatar" className="rounded-circle" style={{ width: '96px', height: '96px' }} />
          ) : (
            <User size={48} className="text-primary" />
          )}
        </div>
        <div>
          <button className="btn btn-primary btn-sm">Change Avatar</button>
          <p className="small text-muted mt-1">JPG, PNG or GIF. Max size 2MB.</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label small text-dark">First Name</label>
          <input
            type="text"
            value={settings.profile.firstName}
            onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small text-dark">Last Name</label>
          <input
            type="text"
            value={settings.profile.lastName}
            onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small text-dark">Email</label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small text-dark">Phone</label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div>
        <label className="form-label small text-dark">Bio</label>
        <textarea
          value={settings.profile.bio}
          onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
          rows={4}
          className="form-control"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Notification Channels</h5>
        </div>
        <div className="card-body">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications in your browser' },
            { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via text message' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="mb-1 text-dark">{label}</h6>
                <p className="small text-muted mb-0">{desc}</p>
              </div>
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                  onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Notification Types</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {[
              { key: 'assignmentReminders', label: 'Assignment Reminders', desc: 'Get reminded about upcoming assignments' },
              { key: 'quizReminders', label: 'Quiz Reminders', desc: 'Get reminded about upcoming quizzes' },
              { key: 'courseUpdates', label: 'Course Updates', desc: 'Receive updates about your courses' },
              { key: 'messages', label: 'New Messages', desc: 'Get notified about new messages' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="col-md-6 d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1 text-dark">{label}</h6>
                  <p className="small text-muted mb-0">{desc}</p>
                </div>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                    onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Change Password</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label small text-dark">Current Password</label>
            <div className="input-group">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={settings.security.currentPassword}
                onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                className="form-control"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                className="btn btn-outline-secondary"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label small text-dark">New Password</label>
            <div className="input-group">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={settings.security.newPassword}
                onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                className="form-control"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                className="btn btn-outline-secondary"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="form-label small text-dark">Confirm New Password</label>
            <div className="input-group">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={settings.security.confirmPassword}
                onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                className="form-control"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                className="btn btn-outline-secondary"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Two-Factor Authentication</h5>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="mb-1 text-dark">Enable 2FA</h6>
              <p className="small text-muted mb-0">Add an extra layer of security to your account</p>
            </div>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label small text-dark">Theme</label>
          <select
            value={settings.preferences.theme}
            onChange={(e) => handleInputChange('preferences', 'theme', e.target.value)}
            className="form-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label small text-dark">Language</label>
          <select
            value={settings.preferences.language}
            onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
            className="form-select"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label small text-dark">Timezone</label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
            className="form-select"
          >
            <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
            <option value="UTC-6 (Central Time)">UTC-6 (Central Time)</option>
            <option value="UTC-7 (Mountain Time)">UTC-7 (Mountain Time)</option>
            <option value="UTC-8 (Pacific Time)">UTC-8 (Pacific Time)</option>
            <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
            <option value="UTC+1 (Central European Time)">UTC+1 (Central European Time)</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label small text-dark">Time Format</label>
          <select
            value={settings.preferences.timeFormat}
            onChange={(e) => handleInputChange('preferences', 'timeFormat', e.target.value)}
            className="form-select"
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>
      <div>
        <label className="form-label small text-dark">Date Format</label>
        <select
          value={settings.preferences.dateFormat}
          onChange={(e) => handleInputChange('preferences', 'dateFormat', e.target.value)}
          className="form-select"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">Settings</h1>
        <p className="text-muted">Manage your account settings and preferences</p>
      </div>

      <div className="card border-0 shadow-sm">
        {/* Tabs */}
        <div className="card-header bg-white border-bottom py-3">
          <ul className="nav nav-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id} className="nav-item">
                  <button
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`nav-link d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="card-body">
          {renderTabContent()}

          {/* Save Button */}
          <div className="mt-4 pt-3 border-top">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;