import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ChevronDown } from 'lucide-react';

/**
 * Branch indicator badge in chat header
 * Shows current branch and allows switching
 */
function BranchIndicator({ branches, activeBranchId, chatId }) {
  const navigate = useNavigate();
  const activeBranch = branches?.find(b => b.id === activeBranchId);
  const branchCount = branches?.length || 1;

  if (branchCount <= 1) {
    return null;
  }

  const handleClick = () => {
    navigate(`/chat/${chatId}/tree`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
      title="View conversation tree"
    >
      <GitBranch size={12} />
      <span>{activeBranch?.name || 'Main'}</span>
      <span className="text-primary/60">({branchCount})</span>
      <ChevronDown size={12} />
    </button>
  );
}

export default BranchIndicator;
