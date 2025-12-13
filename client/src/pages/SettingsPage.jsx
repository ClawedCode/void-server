import React, { useState, useEffect } from 'react';
import { Settings, Bot, Check, X, AlertCircle, Eye, EyeOff, Play, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [providers, setProviders] = useState({});
  const [activeProvider, setActiveProvider] = useState('');
  const [loading, setLoading] = useState(true);
  const [editedConfigs, setEditedConfigs] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});
  const [saving, setSaving] = useState({});

  // Fetch providers on mount
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const res = await fetch('/api/ai-providers');
    const data = await res.json();
    setProviders(data.providers || {});
    setActiveProvider(data.activeProvider || '');
    setEditedConfigs(data.providers || {});
    setLoading(false);
  };

  const handleConfigChange = (providerKey, field, value) => {
    setEditedConfigs(prev => ({
      ...prev,
      [providerKey]: {
        ...prev[providerKey],
        [field]: value
      }
    }));
  };

  const handleModelChange = (providerKey, modelType, value) => {
    setEditedConfigs(prev => ({
      ...prev,
      [providerKey]: {
        ...prev[providerKey],
        models: {
          ...prev[providerKey]?.models,
          [modelType]: value
        }
      }
    }));
  };

  const handleSettingChange = (providerKey, setting, value) => {
    setEditedConfigs(prev => ({
      ...prev,
      [providerKey]: {
        ...prev[providerKey],
        settings: {
          ...prev[providerKey]?.settings,
          [setting]: value
        }
      }
    }));
  };

  const saveProviderConfig = async (providerKey) => {
    setSaving(prev => ({ ...prev, [providerKey]: true }));

    const config = editedConfigs[providerKey];
    const res = await fetch(`/api/ai-providers/${providerKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const data = await res.json();
    setSaving(prev => ({ ...prev, [providerKey]: false }));

    if (data.success) {
      toast.success(`${config.name} configuration saved`);
      fetchProviders(); // Refresh to get updated config
    } else {
      toast.error(data.error || 'Failed to save configuration');
    }
  };

  const testProvider = async (providerKey) => {
    setTesting(prev => ({ ...prev, [providerKey]: true }));
    setTestResults(prev => ({ ...prev, [providerKey]: null }));

    const res = await fetch(`/api/ai-providers/${providerKey}/test`, {
      method: 'POST'
    });

    const data = await res.json();
    setTesting(prev => ({ ...prev, [providerKey]: false }));
    setTestResults(prev => ({ ...prev, [providerKey]: data }));

    if (data.success) {
      toast.success(data.message || 'Connection successful');
    } else {
      toast.error(data.error || 'Connection failed');
    }
  };

  const switchProvider = async (providerKey) => {
    const res = await fetch('/api/ai-providers/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: providerKey })
    });

    const data = await res.json();

    if (data.success) {
      setActiveProvider(providerKey);
      toast.success(data.message || `Switched to ${providerKey}`);
    } else {
      toast.error(data.error || 'Failed to switch provider');
    }
  };

  const toggleApiKeyVisibility = (providerKey) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerKey]: !prev[providerKey]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary">Configure AI providers and system settings</p>
          </div>
        </div>
      </div>

      {/* AI Providers Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Providers
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Configure and manage AI providers for content generation.
        </p>

        <div className="space-y-4">
          {Object.entries(editedConfigs).map(([key, config]) => (
            <ProviderCard
              key={key}
              providerKey={key}
              config={config}
              isActive={key === activeProvider}
              showApiKey={showApiKeys[key]}
              testResult={testResults[key]}
              isTesting={testing[key]}
              isSaving={saving[key]}
              onConfigChange={(field, value) => handleConfigChange(key, field, value)}
              onModelChange={(modelType, value) => handleModelChange(key, modelType, value)}
              onSettingChange={(setting, value) => handleSettingChange(key, setting, value)}
              onToggleApiKey={() => toggleApiKeyVisibility(key)}
              onTest={() => testProvider(key)}
              onSave={() => saveProviderConfig(key)}
              onActivate={() => switchProvider(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ProviderCard = ({
  providerKey,
  config,
  isActive,
  showApiKey,
  testResult,
  isTesting,
  isSaving,
  onConfigChange,
  onModelChange,
  onSettingChange,
  onToggleApiKey,
  onTest,
  onSave,
  onActivate
}) => {
  const isApiProvider = config.type === 'api';
  const isCliProvider = config.type === 'cli';

  return (
    <div className={`border rounded-lg p-4 ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
      {/* Provider Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.enabled ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
            <Bot className={`w-5 h-5 ${config.enabled ? 'text-green-500' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              {config.name}
              {isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Active</span>
              )}
            </h3>
            <p className="text-xs text-text-secondary">
              {isCliProvider ? 'CLI Tool' : 'API Service'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onConfigChange('enabled', e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm text-text-secondary">Enabled</span>
          </label>
        </div>
      </div>

      {/* Provider Config */}
      <div className="space-y-4">
        {/* CLI Provider Config */}
        {isCliProvider && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Command
            </label>
            <input
              type="text"
              value={config.command || ''}
              onChange={(e) => onConfigChange('command', e.target.value)}
              placeholder="claude"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* API Provider Config */}
        {isApiProvider && (
          <>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                API Endpoint
              </label>
              <input
                type="text"
                value={config.endpoint || ''}
                onChange={(e) => onConfigChange('endpoint', e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey || ''}
                  onChange={(e) => onConfigChange('apiKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={onToggleApiKey}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Models */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Models
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['light', 'medium', 'deep'].map(modelType => (
              <div key={modelType}>
                <label className="block text-xs text-text-secondary mb-1 capitalize">
                  {modelType}
                </label>
                <input
                  type="text"
                  value={config.models?.[modelType] || ''}
                  onChange={(e) => onModelChange(modelType, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* API Settings */}
        {isApiProvider && config.settings && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Generation Settings
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={config.settings.temperature ?? 0.7}
                  onChange={(e) => onSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={config.settings.max_tokens ?? 4096}
                  onChange={(e) => onSettingChange('max_tokens', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <div className="flex items-center gap-2">
              {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult.message || testResult.error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={onTest}
            disabled={!config.enabled || isTesting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Test
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/80 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
          {!isActive && config.enabled && (
            <button
              onClick={onActivate}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500"
            >
              <Check className="w-4 h-4" />
              Set Active
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
