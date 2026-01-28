import { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Download,
  Upload,
  RefreshCw,
  Radio,
  Music,
  Users,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Card = ({ title, icon, children, actions }) => {
  const IconComp = icon;
  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <IconComp className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h3>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
    <span className="text-sm font-medium text-[var(--color-text-primary)]">{value}</span>
  </div>
);

export default function AudioSharing() {
  const [stats, setStats] = useState(null);
  const [relayStatus, setRelayStatus] = useState(null);
  const [neo4jPeers, setNeo4jPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [syncing, setSyncing] = useState(null); // peerId being synced
  const [exportMood, setExportMood] = useState('');
  const [importJson, setImportJson] = useState('');
  const [dryRun, setDryRun] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [lastImport, setLastImport] = useState(null);

  const fetchData = useCallback(async () => {
    const [statsRes, relayRes, peersRes] = await Promise.all([
      fetch('/api/federation/audio/sync/stats').then(r => r.json()),
      fetch('/api/federation/relay/status').then(r => r.json()),
      fetch('/api/federation/peers/neo4j').then(r => r.json())
    ]);

    if (statsRes.success) setStats(statsRes.stats);
    if (relayRes.success) setRelayStatus(relayRes);
    setNeo4jPeers(peersRes.peers || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    const res = await fetch('/api/federation/audio/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: exportMood || undefined })
    }).then(r => r.json());

    setExporting(false);

    if (res.success) {
      setLastExport(res.data);
      toast.success(`Exported ${res.data.manifest.count} tracks`);
    } else {
      toast.error(res.error || 'Export failed');
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const res = await fetch('/api/federation/audio/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: exportMood || undefined })
    }).then(r => r.json());

    setPublishing(false);

    if (res.success) {
      toast.success(`Published ${res.stored} tracks to relay`);
    } else {
      toast.error(res.error || 'Publish failed');
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast.error('Paste export JSON data first');
      return;
    }

    let exportData;
    const parsed = JSON.parse(importJson);
    exportData = parsed.data || parsed;

    setImporting(true);
    const res = await fetch('/api/federation/audio/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exportData, dryRun })
    }).then(r => r.json());

    setImporting(false);
    setLastImport(res);

    if (res.success) {
      const action = dryRun ? 'Would import' : 'Imported';
      toast.success(`${action} ${res.imported} tracks (${res.skipped} duplicates)`);
      if (!dryRun) fetchData();
    } else {
      toast.error(res.error || 'Import failed');
    }
  };

  const handlePeerSync = async (peerId) => {
    setSyncing(peerId);
    const res = await fetch(`/api/federation/audio/sync/${peerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json());

    setSyncing(null);

    if (res.success) {
      toast.success(`Synced ${res.imported} tracks from peer (${res.skipped} duplicates)`);
      fetchData();
    } else {
      toast.error(res.error || 'Sync failed');
    }
  };

  const copyExport = () => {
    if (!lastExport) return;
    navigator.clipboard.writeText(JSON.stringify(lastExport, null, 2));
    toast.success('Export data copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-text-secondary)]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading sync data...
      </div>
    );
  }

  const relayPeers = relayStatus?.peers || [];
  const relayPeerIds = new Set(relayPeers.map(p => p.serverId));

  return (
    <div className="space-y-4">
      {/* Sync Status */}
      <Card
        title="Sync Status"
        icon={BarChart3}
        actions={
          <button
            onClick={fetchData}
            className="p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-1">
          <StatRow label="Local tracks" value={stats?.totalLocal || 0} />
          <StatRow label="Federated tracks" value={stats?.totalFederated || 0} />
          <StatRow
            label="Relay"
            value={
              <span className={relayStatus?.connected ? 'text-green-400' : 'text-red-400'}>
                {relayStatus?.connected ? 'Connected' : 'Disconnected'}
              </span>
            }
          />
          <StatRow label="Known peers" value={neo4jPeers.length} />
          <StatRow label="Online now" value={relayPeers.length} />
          {stats?.bySource && Object.keys(stats.bySource).length > 0 && (
            <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">By source:</p>
              {Object.entries(stats.bySource).map(([src, count]) => (
                <StatRow key={src} label={src} value={count} />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Export */}
      <Card title="Export Tracks" icon={Upload}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
              Filter by mood (optional)
            </label>
            <input
              type="text"
              value={exportMood}
              onChange={e => setExportMood(e.target.value)}
              placeholder="e.g. kavinsky-outrun"
              className="w-full px-3 py-1.5 text-sm rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] disabled:opacity-50"
            >
              {exporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Export
            </button>
            {relayStatus?.connected && relayStatus?.authenticated && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-purple-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                {publishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                Publish to Relay
              </button>
            )}
          </div>
          {lastExport && (
            <div className="mt-2 p-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Exported {lastExport.manifest.count} tracks
                </span>
                <button
                  onClick={copyExport}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  Copy JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Import */}
      <Card title="Import Tracks" icon={Download}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
              Paste export JSON
            </label>
            <textarea
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              placeholder='Paste export data from another server...'
              rows={4}
              className="w-full px-3 py-1.5 text-sm rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
                className="rounded"
              />
              Dry run
            </label>
            <button
              onClick={handleImport}
              disabled={importing || !importJson.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] disabled:opacity-50"
            >
              {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {dryRun ? 'Preview' : 'Import'}
            </button>
          </div>
          {lastImport && (
            <div className="mt-2 p-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                {lastImport.dryRun ? 'Preview: ' : ''}
                {lastImport.imported} imported, {lastImport.skipped} duplicates
                {lastImport.errors?.length > 0 && `, ${lastImport.errors.length} errors`}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Peer Sync */}
      <Card title="Peer Sync" icon={Users}>
        {neo4jPeers.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            No peers found. Add peers from the Federation page.
          </p>
        ) : (
          <div className="space-y-2">
            {neo4jPeers.map(peer => {
              const isOnline = relayPeerIds.has(peer.serverId);
              return (
                <div
                  key={peer.serverId}
                  className="flex items-center justify-between p-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <span className="text-sm text-[var(--color-text-primary)] truncate">
                      {peer.serverId}
                    </span>
                    {isOnline && (
                      <span className="text-[10px] text-green-400 flex-shrink-0">online</span>
                    )}
                  </div>
                  <button
                    onClick={() => handlePeerSync(peer.serverId)}
                    disabled={syncing === peer.serverId}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] disabled:opacity-50 flex-shrink-0"
                  >
                    {syncing === peer.serverId ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Sync
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {stats?.syncStates && Object.keys(stats.syncStates).length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">Sync history:</p>
            {Object.entries(stats.syncStates).map(([peerId, state]) => (
              <div key={peerId} className="text-xs text-[var(--color-text-secondary)] py-0.5">
                <span className="font-medium">{peerId}</span>
                {' — '}
                {state.tracksImported || 0} tracks imported
                {state.lastSync && `, last sync ${new Date(state.lastSync).toLocaleDateString()}`}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
