import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Play, X, RefreshCw, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrowsersPage() {
  const [browsers, setBrowsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBrowser, setNewBrowser] = useState({ id: '', name: '', description: '' });
  const [isDockerEnv, setIsDockerEnv] = useState(false);

  useEffect(() => {
    loadBrowsers();
  }, []);

  const loadBrowsers = async () => {
    setLoading(true);
    const response = await fetch('/api/browsers');
    const data = await response.json();

    if (data.success) {
      setBrowsers(data.browsers);
      // Check if any launch attempt returned isDocker
      setIsDockerEnv(data.isDocker || false);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newBrowser.id.trim()) {
      toast.error('Browser ID is required');
      return;
    }

    setCreating(true);
    const response = await fetch('/api/browsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBrowser)
    });

    const data = await response.json();
    setCreating(false);

    if (data.success) {
      toast.success('Browser profile created');
      setShowCreateForm(false);
      setNewBrowser({ id: '', name: '', description: '' });
      loadBrowsers();
    } else {
      toast.error(data.error || 'Failed to create browser profile');
    }
  };

  const handleLaunch = async (id, url) => {
    toast.loading('Launching browser...', { id: `launch-${id}` });

    const response = await fetch(`/api/browsers/${id}/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Browser launched. Log in, then close the window.', { id: `launch-${id}`, duration: 10000 });
      // Poll for status
      pollBrowserStatus(id);
    } else {
      if (data.isDocker) {
        setIsDockerEnv(true);
      }
      toast.error(data.error || 'Failed to launch browser', { id: `launch-${id}` });
    }

    loadBrowsers();
  };

  const pollBrowserStatus = (id) => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/browsers/${id}/status`);
      const data = await response.json();

      if (!data.running) {
        clearInterval(interval);
        loadBrowsers();
        if (data.authenticated) {
          toast.success(`Browser "${data.name}" authenticated!`);
        }
      }
    }, 2000);

    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleClose = async (id) => {
    const response = await fetch(`/api/browsers/${id}/close`, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      toast.success('Browser closed');
    } else {
      toast.error(data.error || 'Failed to close browser');
    }

    loadBrowsers();
  };

  const handleDelete = async (id) => {
    const response = await fetch(`/api/browsers/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (data.success) {
      toast.success('Browser profile deleted');
    } else {
      toast.error(data.error || 'Failed to delete browser profile');
    }

    loadBrowsers();
  };

  const renderStatusBadge = (browser) => {
    if (browser.running) {
      return (
        <span className="flex items-center gap-1 text-sm text-warning">
          <RefreshCw size={14} className="animate-spin" />
          Running
        </span>
      );
    }

    if (browser.authenticated) {
      return (
        <span className="flex items-center gap-1 text-sm text-success">
          <CheckCircle size={14} />
          Authenticated
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-sm text-tertiary">
        <XCircle size={14} />
        Not Authenticated
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Browser Profiles</h1>
            <p className="text-secondary text-sm">Manage authenticated browser sessions for plugins</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadBrowsers} className="btn btn-ghost p-2" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Profile
          </button>
        </div>
      </div>

      {/* Docker Warning */}
      {isDockerEnv && (
        <div className="card border-warning bg-warning/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text-primary">Running in Docker</h3>
              <p className="text-secondary text-sm mt-1">
                Browser GUI cannot be launched inside Docker containers. To authenticate browsers:
              </p>
              <ol className="list-decimal list-inside text-sm text-secondary mt-2 space-y-1">
                <li>Run void-server natively: <code className="bg-surface px-1 rounded">./run.sh native</code></li>
                <li>Create and authenticate browser profiles</li>
                <li>Switch back to Docker - profiles persist in <code className="bg-surface px-1 rounded">config/browsers/</code></li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Create Browser Profile</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Profile ID <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={newBrowser.id}
                onChange={(e) => setNewBrowser({ ...newBrowser, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="x-auth"
                className="form-input w-full"
              />
              <p className="text-xs text-tertiary mt-1">Lowercase letters, numbers, hyphens only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={newBrowser.name}
                onChange={(e) => setNewBrowser({ ...newBrowser, name: e.target.value })}
                placeholder="X.com Authentication"
                className="form-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Description
            </label>
            <input
              type="text"
              value={newBrowser.description}
              onChange={(e) => setNewBrowser({ ...newBrowser, description: e.target.value })}
              placeholder="Browser profile for downloading X.com videos"
              className="form-input w-full"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowCreateForm(false); setNewBrowser({ id: '', name: '', description: '' }); }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !newBrowser.id.trim()}
              className="btn btn-primary"
            >
              {creating ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Browser List */}
      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : browsers.length === 0 ? (
        <div className="card text-center py-12">
          <Globe className="w-12 h-12 text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary">No Browser Profiles</h3>
          <p className="text-secondary mt-2">Create a browser profile to store authenticated sessions for plugins.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {browsers.map((browser) => (
            <div key={browser.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Globe className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{browser.name || browser.id}</h3>
                    {browser.description && (
                      <p className="text-secondary text-sm">{browser.description}</p>
                    )}
                    <p className="text-xs text-tertiary mt-1">ID: {browser.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {renderStatusBadge(browser)}

                  <div className="flex items-center gap-2">
                    {browser.running ? (
                      <button
                        onClick={() => handleClose(browser.id)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                        title="Close browser"
                      >
                        <X size={16} />
                        Close
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleLaunch(browser.id, 'https://x.com/login')}
                          className="btn btn-primary btn-sm flex items-center gap-1"
                          title="Launch for X.com authentication"
                          disabled={isDockerEnv}
                        >
                          <Play size={16} />
                          Launch (X.com)
                        </button>
                        <button
                          onClick={() => handleLaunch(browser.id)}
                          className="btn btn-secondary btn-sm flex items-center gap-1"
                          title="Launch with blank page"
                          disabled={isDockerEnv}
                        >
                          <ExternalLink size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(browser.id)}
                      className="btn btn-ghost btn-sm text-error"
                      title="Delete profile"
                      disabled={browser.running}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Info */}
      <div className="card bg-surface-alt">
        <h3 className="text-lg font-semibold text-text-primary mb-3">How Browser Profiles Work</h3>
        <div className="space-y-2 text-sm text-secondary">
          <p>Browser profiles store authentication cookies/sessions for plugins that need web access.</p>
          <p><strong>Setup:</strong> Create a profile, launch the browser, log into the website, close the browser.</p>
          <p><strong>Usage:</strong> Plugins can use authenticated profiles for headless operations (e.g., video downloads).</p>
          <p><strong>Docker:</strong> Profiles are stored in <code className="bg-surface px-1 rounded">config/browsers/</code> and persist across container restarts.</p>
        </div>
      </div>
    </div>
  );
}
