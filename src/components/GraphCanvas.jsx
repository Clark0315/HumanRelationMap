import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphCanvas = ({
  persons,
  relations,
  selectedNode,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
  onUpdatePerson,
  onDeletePerson,
  onAddRelation,
  onDeleteRelation
}) => {
  const svgRef = useRef();
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, target: null });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .filter((event) => {
        // Allow zoom on wheel events, or pan with middle mouse button
        return event.type === 'wheel' || event.button === 1 || event.touches?.length > 1;
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Add a background rectangle to capture clicks on empty space
    g.append('rect')
      .attr('x', -10000)
      .attr('y', -10000)
      .attr('width', 20000)
      .attr('height', 20000)
      .attr('fill', 'transparent')
      .style('cursor', 'default')
      .on('click', (event) => {
        event.stopPropagation();
        onSelectNode(null);
        onSelectEdge(null);
        setIsConnecting(false);
        setConnectFrom(null);
      });

    // Helper function to calculate curved path for bidirectional relationships
    const calculateCurvedPath = (d, offset = 0) => {
      const fromPerson = persons.find(p => p.id === d.from);
      const toPerson = persons.find(p => p.id === d.to);

      if (!fromPerson || !toPerson) return '';

      const dx = toPerson.x - fromPerson.x;
      const dy = toPerson.y - fromPerson.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Calculate perpendicular offset for curved line
      const perpX = -dy / distance * offset;
      const perpY = dx / distance * offset;

      // Control point for the curve
      const midX = (fromPerson.x + toPerson.x) / 2 + perpX;
      const midY = (fromPerson.y + toPerson.y) / 2 + perpY;

      return `M ${fromPerson.x} ${fromPerson.y} Q ${midX} ${midY} ${toPerson.x} ${toPerson.y}`;
    };

    // Check for bidirectional relationships and add offset
    const edgesWithOffset = relations.map(relation => {
      const reverseRelation = relations.find(r =>
        r.from === relation.to && r.to === relation.from
      );

      if (reverseRelation) {
        // For bidirectional relationships, we need to make them curve to different sides
        // Create a consistent identifier for the relationship pair
        const pairId = [relation.from, relation.to].sort().join('-');

        // Use hash of relation.id to determine which side each curve goes
        // This ensures consistent but different offsets for the two directions
        const relationHash = relation.id.charCodeAt(0) + relation.id.charCodeAt(relation.id.length - 1);
        const offset = (relationHash % 2 === 0) ? 20 : -20;

        return { ...relation, offset };
      } else {
        return { ...relation, offset: 0 };
      }
    });

    // Draw relations (edges)
    const edges = g.selectAll('.edge')
      .data(edgesWithOffset)
      .enter()
      .append('g')
      .attr('class', 'edge');

    edges.append('path')
      .attr('d', d => calculateCurvedPath(d, d.offset))
      .attr('stroke', d => selectedEdge?.id === d.id ? '#3b82f6' : '#6b7280')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectEdge(d);
        onSelectNode(null);
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        setContextMenu({
          show: true,
          x: event.pageX,
          y: event.pageY,
          target: { type: 'edge', data: d }
        });
      });

    // Add edge labels
    edges.append('text')
      .attr('x', d => {
        const fromPerson = persons.find(p => p.id === d.from);
        const toPerson = persons.find(p => p.id === d.to);
        if (!fromPerson || !toPerson) return 0;

        const dx = toPerson.x - fromPerson.x;
        const dy = toPerson.y - fromPerson.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / distance * d.offset;

        return (fromPerson.x + toPerson.x) / 2 + perpX;
      })
      .attr('y', d => {
        const fromPerson = persons.find(p => p.id === d.from);
        const toPerson = persons.find(p => p.id === d.to);
        if (!fromPerson || !toPerson) return 0;

        const dx = toPerson.x - fromPerson.x;
        const dy = toPerson.y - fromPerson.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const perpY = dx / distance * d.offset;

        return (fromPerson.y + toPerson.y) / 2 + perpY - 5;
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .attr('background', 'white')
      .text(d => d.label);

    // Define arrowhead marker
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 13)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 13)
      .attr('markerHeight', 13)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#6b7280')
      .style('stroke', 'none');

    // Draw persons (nodes)
    const nodes = g.selectAll('.node')
      .data(persons)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Node circle
    nodes.append('circle')
      .attr('r', 25)
      .attr('fill', d => selectedNode?.id === d.id ? '#3b82f6' : '#f3f4f6')
      .attr('stroke', d => selectedNode?.id === d.id ? '#1d4ed8' : '#9ca3af')
      .attr('stroke-width', 2);

    // Node image (if available)
    nodes.filter(d => d.photo)
      .append('image')
      .attr('href', d => d.photo)
      .attr('x', -20)
      .attr('y', -20)
      .attr('width', 40)
      .attr('height', 40)
      .attr('clip-path', 'circle(20px at 50% 50%)');

    // Node text
    nodes.append('text')
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text(d => d.name);

    // Node drag behavior
    let isDragging = false;
    const drag = d3.drag()
      .on('start', function(event, d) {
        isDragging = false;
        d3.select(this).raise().attr('stroke', '#1d4ed8');
      })
      .on('drag', function(event, d) {
        isDragging = true;
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr('transform', `translate(${d.x},${d.y})`);

        // Update connected edges
        svg.selectAll('.edge path')
          .attr('d', edge => calculateCurvedPath(edge, edge.offset || 0));

        svg.selectAll('.edge text')
          .attr('x', edge => {
            const fromPerson = persons.find(p => p.id === edge.from);
            const toPerson = persons.find(p => p.id === edge.to);
            if (!fromPerson || !toPerson) return 0;

            const dx = toPerson.x - fromPerson.x;
            const dy = toPerson.y - fromPerson.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / distance * (edge.offset || 0);

            return (fromPerson.x + toPerson.x) / 2 + perpX;
          })
          .attr('y', edge => {
            const fromPerson = persons.find(p => p.id === edge.from);
            const toPerson = persons.find(p => p.id === edge.to);
            if (!fromPerson || !toPerson) return 0;

            const dx = toPerson.x - fromPerson.x;
            const dy = toPerson.y - fromPerson.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const perpY = dx / distance * (edge.offset || 0);

            return (fromPerson.y + toPerson.y) / 2 + perpY - 5;
          });
      })
      .on('end', function(event, d) {
        if (isDragging) {
          onUpdatePerson(d.id, { x: d.x, y: d.y });
        }
        isDragging = false;
      });

    nodes.call(drag);

    // Node click handlers
    nodes.on('click', (event, d) => {
      event.stopPropagation();

      // Don't process click if we were just dragging
      if (isDragging) {
        return;
      }

      if (isConnecting) {
        if (connectFrom && connectFrom.id !== d.id) {
          const label = prompt('請輸入關係名稱（最多8字）：');
          if (label && label.trim() && label.length <= 8) {
            onAddRelation({
              from: connectFrom.id,
              to: d.id,
              label: label.trim(),
              note: ''
            });
          }
        }
        // Always exit connecting mode after clicking a node
        setIsConnecting(false);
        setConnectFrom(null);
      } else {
        onSelectNode(d);
        onSelectEdge(null);
      }
    })
    .on('contextmenu', (event, d) => {
      event.preventDefault();
      setContextMenu({
        show: true,
        x: event.pageX,
        y: event.pageY,
        target: { type: 'node', data: d }
      });
    });


  }, [persons, relations, selectedNode, selectedEdge, isConnecting, connectFrom]);

  const handleContextMenuAction = (action) => {
    const { target } = contextMenu;

    if (target.type === 'node') {
      switch (action) {
        case 'edit':
          onSelectNode(target.data);
          break;
        case 'delete':
          if (window.confirm('確定要刪除此人員嗎？')) {
            onDeletePerson(target.data.id);
          }
          break;
        case 'connect':
          setIsConnecting(true);
          setConnectFrom(target.data);
          break;
        default:
          break;
      }
    } else if (target.type === 'edge') {
      switch (action) {
        case 'edit':
          onSelectEdge(target.data);
          break;
        case 'delete':
          if (window.confirm('確定要刪除此關係嗎？')) {
            onDeleteRelation(target.data.id);
          }
          break;
        default:
          break;
      }
    }

    setContextMenu({ show: false, x: 0, y: 0, target: null });
  };

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full bg-white"
        style={{ cursor: isConnecting ? 'crosshair' : 'default' }}
      />

      {isConnecting && (
        <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded p-2">
          <p className="text-sm text-blue-800">
            連線模式：請點擊目標節點建立關係
          </p>
          <button
            onClick={() => {
              setIsConnecting(false);
              setConnectFrom(null);
            }}
            className="text-xs text-blue-600 underline mt-1"
          >
            取消
          </button>
        </div>
      )}

      {contextMenu.show && (
        <div
          className="fixed bg-white border shadow-lg rounded py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.target?.type === 'node' && (
            <>
              <button
                onClick={() => handleContextMenuAction('edit')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                編輯
              </button>
              <button
                onClick={() => handleContextMenuAction('connect')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                建立關係
              </button>
              <button
                onClick={() => handleContextMenuAction('delete')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                刪除
              </button>
            </>
          )}
          {contextMenu.target?.type === 'edge' && (
            <>
              <button
                onClick={() => handleContextMenuAction('edit')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                編輯關係
              </button>
              <button
                onClick={() => handleContextMenuAction('delete')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                刪除關係
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;