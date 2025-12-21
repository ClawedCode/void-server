import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, GitBranch } from 'lucide-react';

/**
 * Visual tree overlay for navigating branched conversations
 * Renders a UML-style diagram of the conversation tree
 */
function BranchTreeOverlay({
  isOpen,
  onClose,
  tree,
  branches,
  activeBranchId,
  onMessageSelect,
  personaName = 'Clawed',
  isFullPage = false,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 30 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Layout configuration
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 50;
  const HORIZONTAL_GAP = 40;
  const VERTICAL_GAP = 20;

  // Calculate tree layout positions - compact horizontal tree
  const calculateLayout = useCallback((nodes) => {
    const positions = [];
    let nextY = 0;

    // Recursive function to layout a subtree, returns the Y range used
    const layoutNode = (node, depth) => {
      const x = depth * (NODE_WIDTH + HORIZONTAL_GAP);

      // If no children, place at next available Y
      if (!node.children || node.children.length === 0) {
        const y = nextY;
        nextY += NODE_HEIGHT + VERTICAL_GAP;
        positions.push({ ...node, x, y, depth });
        return { minY: y, maxY: y };
      }

      // Layout children first to know their Y range
      const childRanges = node.children.map(child => layoutNode(child, depth + 1));

      // Center this node vertically among its children
      const minChildY = Math.min(...childRanges.map(r => r.minY));
      const maxChildY = Math.max(...childRanges.map(r => r.maxY));
      const y = (minChildY + maxChildY) / 2;

      positions.push({ ...node, x, y, depth });
      return { minY: Math.min(y, minChildY), maxY: Math.max(y, maxChildY) };
    };

    // Layout each root node
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => layoutNode(node, 0));
    }

    return positions;
  }, []);

  // Flatten tree and calculate positions
  const [nodePositions, setNodePositions] = useState([]);

  useEffect(() => {
    if (tree && tree.length > 0) {
      const positions = calculateLayout(tree);
      setNodePositions(positions);
    }
  }, [tree, calculateLayout]);

  // Handle zoom
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2));

  // Fit content to available space
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || nodePositions.length === 0) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 100; // padding
    const containerHeight = container.clientHeight - 100;

    const contentWidth = Math.max(...nodePositions.map(n => n.x)) + NODE_WIDTH + 50;
    const contentHeight = Math.max(...nodePositions.map(n => n.y)) + NODE_HEIGHT + 50;

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 2);

    setZoom(newZoom);
    setPan({ x: 50, y: 50 });
  }, [nodePositions]);

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 50, y: 30 });
  };

  // Auto-fit on initial load
  useEffect(() => {
    if (nodePositions.length > 0 && containerRef.current) {
      // Small delay to ensure container is rendered
      const timer = setTimeout(handleFitToScreen, 100);
      return () => clearTimeout(timer);
    }
  }, [nodePositions.length, handleFitToScreen]);

  // Handle pan
  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'svg') {
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  // Handle node click
  const handleNodeClick = (node) => {
    if (onMessageSelect) {
      onMessageSelect(node.id);
    }
  };

  // Get color based on role - muted colors for better readability
  const getNodeColor = (role) => {
    // Muted teal for user, muted slate-blue for assistant
    return role === 'user' ? '#115e59' : '#334155';
  };

  // Get label based on role
  const getRoleLabel = (role) => {
    return role === 'user' ? 'Me' : personaName.toUpperCase();
  };

  if (!isOpen) return null;

  // Calculate SVG dimensions with padding
  const maxX = nodePositions.length > 0
    ? Math.max(...nodePositions.map(n => n.x)) + NODE_WIDTH + 200
    : 800;
  const maxY = nodePositions.length > 0
    ? Math.max(...nodePositions.map(n => n.y)) + NODE_HEIGHT + 200
    : 600;

  // Container class based on mode
  const containerClass = isFullPage
    ? "h-full flex flex-col bg-background"
    : "fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col";

  return (
    <div className={containerClass}>
      {/* Header - hidden in full page mode since parent has its own */}
      {!isFullPage && (
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <GitBranch size={24} className="text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Conversation Tree</h2>
          <span className="text-sm text-text-tertiary">
            {nodePositions.length} messages • {branches?.length || 0} branches
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-sm text-text-tertiary min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
            title="Reset view"
          >
            <Maximize2 size={20} />
          </button>
          <div className="w-px h-6 bg-border mx-2" />
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#115e59]" />
          <span className="text-xs text-text-secondary">Me</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#334155]" />
          <span className="text-xs text-text-secondary">{personaName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#334155] outline outline-[3px] outline-[#00db38]" />
          <span className="text-xs text-text-secondary">Active branch tip</span>
        </div>
        <div className="text-xs text-text-tertiary ml-auto">
          Click and drag to pan • Scroll or use buttons to zoom
        </div>
      </div>

      {/* Tree canvas */}
      <div className="flex-1 relative">
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-surface/90 backdrop-blur-sm rounded-lg p-2 border border-border shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <div className="text-xs text-text-tertiary text-center py-1">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <div className="w-full h-px bg-border my-1" />
          <button
            onClick={handleFitToScreen}
            className="p-2 rounded hover:bg-border/50 text-text-secondary"
            title="Fit to screen"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(z => Math.max(0.2, Math.min(3, z + delta)));
          }}
        >
        <svg
          ref={svgRef}
          data-testid="conversation-tree"
          width={maxX}
          height={maxY}
          viewBox={`0 0 ${maxX} ${maxY}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            overflow: 'visible',
          }}
        >
          {/* Draw connections first (behind nodes) */}
          <g className="connections">
            {nodePositions.map((node) => {
              if (!node.children) return null;
              return node.children.map((child) => {
                const childNode = nodePositions.find(n => n.id === child.id);
                if (!childNode) return null;

                const startX = node.x + NODE_WIDTH;
                const startY = node.y + NODE_HEIGHT / 2;
                const endX = childNode.x;
                const endY = childNode.y + NODE_HEIGHT / 2;

                // Bezier curve for smooth connection
                const midX = (startX + endX) / 2;

                return (
                  <path
                    key={`${node.id}-${child.id}`}
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="2"
                    className="transition-colors"
                  />
                );
              });
            })}
          </g>

          {/* Draw nodes */}
          <g className="nodes">
            {nodePositions.map((node) => {
              const isTip = branches?.some(b => b.tipMessageId === node.id);
              const isActiveTip = branches?.find(b => b.id === activeBranchId)?.tipMessageId === node.id;
              const isHovered = hoveredNode === node.id;
              const nodeColor = getNodeColor(node.role, isActiveTip);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                >
                  {/* Node background - fully opaque for readability */}
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx="8"
                    fill={nodeColor}
                    stroke={isActiveTip ? '#00db38' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isActiveTip ? 3 : 1}
                    className="transition-all duration-150"
                    style={{ filter: isHovered ? 'brightness(1.2)' : 'none' }}
                  />

                  {/* Branch tip indicator */}
                  {isTip && (
                    <circle
                      cx={NODE_WIDTH - 12}
                      cy="12"
                      r="6"
                      fill={isActiveTip ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
                    />
                  )}

                  {/* Role label */}
                  <text
                    x="10"
                    y="18"
                    fontSize="10"
                    fill="rgba(255,255,255,0.9)"
                    fontWeight="600"
                  >
                    {getRoleLabel(node.role)}
                  </text>

                  {/* Message preview */}
                  <text
                    x="10"
                    y="36"
                    fontSize="11"
                    fill="rgba(255,255,255,0.85)"
                  >
                    {node.preview?.length > 18
                      ? node.preview.substring(0, 18) + '...'
                      : node.preview || '(empty)'}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        </div>
      </div>

      {/* Hovered node tooltip */}
      {hoveredNode && (() => {
        const node = nodePositions.find(n => n.id === hoveredNode);
        if (!node) return null;
        // Clean up memory tags for display
        const cleanContent = (node.preview || '')
          .replace(/<memory[^>]*>[\s\S]*?<\/memory>/gi, '')
          .replace(/\(length = \w+\)/gi, '')
          .trim();
        return (
          <div className="absolute bottom-4 left-4 right-4 max-h-48 overflow-y-auto p-4 bg-surface border border-border rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                node.role === 'user' ? 'bg-[#115e59] text-white' : 'bg-[#334155] text-white'
              }`}>
                {node.role === 'user' ? 'Me' : personaName}
              </span>
            </div>
            <div className="text-sm text-text-primary whitespace-pre-wrap">
              {cleanContent || '(empty message)'}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default BranchTreeOverlay;
