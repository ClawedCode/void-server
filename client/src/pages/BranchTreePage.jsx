import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BranchTreeOverlay from '../components/chat/BranchTreeOverlay';

/**
 * Dedicated page for viewing the conversation tree
 */
function BranchTreePage() {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [treeStructure, setTreeStructure] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(null);
  const [chatTitle, setChatTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTreeData = useCallback(async () => {
    setLoading(true);

    // Fetch chat info
    const chatResponse = await fetch(`/api/chat/${chatId}`);
    const chatData = await chatResponse.json();

    if (!chatData.success) {
      navigate('/chat');
      return;
    }

    setChatTitle(chatData.chat.title);
    setActiveBranchId(chatData.chat.activeBranchId);

    // Fetch tree structure
    const treeResponse = await fetch(`/api/chat/${chatId}/tree`);
    const treeData = await treeResponse.json();

    if (treeData.success) {
      setTreeStructure(treeData.tree);
      setBranches(treeData.branches);
    }

    setLoading(false);
  }, [chatId, navigate]);

  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  const handleMessageSelect = () => {
    // Navigate to the chat at that message
    navigate(`/chat/${chatId}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-secondary">Loading tree...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Back button header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <button
          onClick={() => navigate(`/chat/${chatId}`)}
          className="p-2 rounded hover:bg-border/50 text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-medium text-text-primary">{chatTitle}</h1>
          <p className="text-sm text-text-tertiary">Conversation Tree View</p>
        </div>
      </div>

      {/* Tree overlay in full page mode */}
      <div className="flex-1">
        <BranchTreeOverlay
          isOpen={true}
          onClose={() => navigate(`/chat/${chatId}`)}
          tree={treeStructure}
          branches={branches}
          activeBranchId={activeBranchId}
          onMessageSelect={handleMessageSelect}
          personaName="Clawed"
          isFullPage={true}
        />
      </div>
    </div>
  );
}

export default BranchTreePage;
