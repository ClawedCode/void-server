import React, { useState } from 'react';
import { GitBranch, ChevronRight, X, Trash2, Edit2, Check } from 'lucide-react';

/**
 * Branch tree sidebar for navigating conversation branches
 */
function BranchTreeSidebar({
  isOpen,
  onClose,
  branches,
  activeBranchId,
  onBranchSelect,
  onBranchDelete,
  onBranchRename,
}) {
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleStartRename = (branch, e) => {
    e.stopPropagation();
    setEditingBranchId(branch.id);
    setEditName(branch.name);
  };

  const handleSaveRename = async (branchId, e) => {
    e.stopPropagation();
    if (editName.trim() && onBranchRename) {
      await onBranchRename(branchId, editName.trim());
    }
    setEditingBranchId(null);
    setEditName('');
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingBranchId(null);
    setEditName('');
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 flex flex-col border border-border rounded-lg bg-surface">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-primary font-medium">
          <GitBranch size={18} />
          <span>Branches</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-border/50 text-text-secondary"
        >
          <X size={18} />
        </button>
      </div>

      {/* Branch list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {branches.map(branch => (
          <div
            key={branch.id}
            onClick={() => onBranchSelect(branch.id)}
            className={`
              group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
              ${branch.id === activeBranchId
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-border/50 text-text-primary'
              }
            `}
          >
            <GitBranch size={14} className="flex-shrink-0" />

            {editingBranchId === branch.id ? (
              <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveRename(branch.id, e);
                    if (e.key === 'Escape') handleCancelRename(e);
                  }}
                  className="flex-1 px-1 py-0.5 text-sm bg-background border border-border rounded"
                  autoFocus
                />
                <button
                  onClick={(e) => handleSaveRename(branch.id, e)}
                  className="p-1 rounded hover:bg-success/20 text-success"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="p-1 rounded hover:bg-error/20 text-error"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{branch.name}</div>
                  {branch.messageCount !== undefined && (
                    <div className="text-xs text-text-tertiary">
                      {branch.messageCount} message{branch.messageCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Branch actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleStartRename(branch, e)}
                    className="p-1 rounded hover:bg-border/50 text-text-tertiary hover:text-text-primary"
                    title="Rename branch"
                  >
                    <Edit2 size={12} />
                  </button>
                  {branch.id !== 'branch-main' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBranchDelete(branch.id);
                      }}
                      className="p-1 rounded hover:bg-error/20 text-text-tertiary hover:text-error"
                      title="Delete branch"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {branches.length === 0 && (
          <p className="text-center text-text-tertiary text-sm py-4">
            No branches yet
          </p>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-border text-xs text-text-tertiary">
        <p>Fork a conversation by hovering over any message and clicking the branch icon.</p>
      </div>
    </div>
  );
}

export default BranchTreeSidebar;
