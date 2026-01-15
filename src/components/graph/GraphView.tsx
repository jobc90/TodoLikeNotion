'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

interface GraphNode {
  id: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphViewProps {
  nodes: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>[];
  edges: GraphEdge[];
}

export default function GraphView({ nodes: initialNodes, edges }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ nodeId: string | null; isPanning: boolean }>({
    nodeId: null,
    isPanning: false,
  });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Initialize nodes with random positions
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const initializedNodes = initialNodes.map((node) => ({
      ...node,
      x: Math.random() * width * 0.6 + width * 0.2,
      y: Math.random() * height * 0.6 + height * 0.2,
      vx: 0,
      vy: 0,
    }));

    setNodes(initializedNodes);
    setOffset({ x: width / 2, y: height / 2 });
  }, [initialNodes]);

  // Force-directed layout simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes((prevNodes) => {
        const newNodes = prevNodes.map((node) => ({ ...node }));
        const nodeMap = new Map(newNodes.map((n) => [n.id, n]));

        // Reset forces
        newNodes.forEach((node) => {
          node.vx = 0;
          node.vy = 0;
        });

        // Repulsion between nodes
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const nodeA = newNodes[i];
            const nodeB = newNodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 5000 / (distance * distance);

            nodeA.vx -= (dx / distance) * force;
            nodeA.vy -= (dy / distance) * force;
            nodeB.vx += (dx / distance) * force;
            nodeB.vy += (dy / distance) * force;
          }
        }

        // Attraction along edges
        edges.forEach((edge) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (!source || !target) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance * 0.01;

          source.vx += (dx / distance) * force;
          source.vy += (dy / distance) * force;
          target.vx -= (dx / distance) * force;
          target.vy -= (dy / distance) * force;
        });

        // Apply forces and damping
        newNodes.forEach((node) => {
          node.x += node.vx * 0.1;
          node.y += node.vy * 0.1;
          node.vx *= 0.8;
          node.vy *= 0.8;
        });

        return newNodes;
      });
    };

    const interval = setInterval(simulate, 50);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [edges, nodes.length]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = getComputedStyle(canvas).getPropertyValue('background-color') || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-edge')
      .trim() || '#e5e7eb';
    ctx.lineWidth = 2 / zoom;

    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-node')
        .trim() || '#3b82f6';
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-node-border')
        .trim() || '#2563eb';
      ctx.lineWidth = 2 / zoom;

      ctx.beginPath();
      ctx.arc(node.x, node.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icon
      ctx.font = `${20 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(node.icon || '📄', node.x, node.y);

      // Title
      ctx.font = `${12 / zoom}px sans-serif`;
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-text')
        .trim() || '#000000';
      ctx.fillText(
        node.title.length > 15 ? node.title.slice(0, 15) + '...' : node.title,
        node.x,
        node.y + 45
      );
    });

    ctx.restore();
  }, [nodes, edges, zoom, offset]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = (screenX - rect.left - offset.x) / zoom;
      const y = (screenY - rect.top - offset.y) / zoom;
      return { x, y };
    },
    [zoom, offset]
  );

  // Find node at position
  const findNodeAt = useCallback(
    (x: number, y: number) => {
      return nodes.find((node) => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= 30;
      });
    },
    [nodes]
  );

  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const node = findNodeAt(x, y);

    if (node) {
      setDragging({ nodeId: node.id, isPanning: false });
    } else {
      setDragging({ nodeId: null, isPanning: true });
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging.nodeId) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === dragging.nodeId ? { ...node, x, y, vx: 0, vy: 0 } : node
        )
      );
    } else if (dragging.isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // Mouse up handler
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging.nodeId && !dragging.isPanning) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      const node = findNodeAt(x, y);

      if (node && node.id === dragging.nodeId) {
        router.push(`/pages/${node.id}`);
      }
    }

    setDragging({ nodeId: null, isPanning: false });
  };

  // Wheel handler for zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(5, prev * 1.2))}
          className="rounded bg-white px-3 py-2 shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(0.1, prev / 1.2))}
          className="rounded bg-white px-3 py-2 shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            const width = containerRef.current?.clientWidth || 800;
            const height = containerRef.current?.clientHeight || 600;
            setOffset({ x: width / 2, y: height / 2 });
          }}
          className="rounded bg-white px-3 py-2 text-sm shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Reset view"
        >
          Reset
        </button>
      </div>
      <style jsx global>{`
        :root {
          --color-edge: #e5e7eb;
          --color-node: #3b82f6;
          --color-node-border: #2563eb;
          --color-text: #000000;
        }
        .dark {
          --color-edge: #374151;
          --color-node: #3b82f6;
          --color-node-border: #2563eb;
          --color-text: #ffffff;
        }
      `}</style>
    </div>
  );
}
