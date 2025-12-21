import React from 'react';
import { GitBranch } from 'lucide-react';

/**
 * Fork button that appears on message hover
 * Allows creating a new branch from any message
 */
function ForkButton({ messageId, onFork, disabled }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled && onFork) {
      onFork(messageId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        p-1.5 rounded border border-transparent transition-all duration-150
        ${disabled
          ? 'opacity-30 cursor-not-allowed text-text-tertiary'
          : 'text-text-secondary opacity-60 group-hover:opacity-100 group-hover:border-border hover:bg-primary/20 hover:text-primary hover:border-primary/50'
        }
      `}
      title="Fork conversation from here"
    >
      <GitBranch size={16} />
    </button>
  );
}

export default ForkButton;
