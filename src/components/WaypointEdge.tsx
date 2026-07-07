import React from "react";
import { useReactFlow } from "@xyflow/react";

export default function WaypointEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  style = {},
  markerEnd,
  data
}: any) {
  const { screenToFlowPosition, setEdges } = useReactFlow();
  const waypoints = data?.waypoints || [];

  // Build connection path passing through all waypoints
  let pathD = `M ${sourceX} ${sourceY}`;
  for (const wp of waypoints) {
    pathD += ` L ${wp[0]} ${wp[1]}`;
  }
  pathD += ` L ${targetX} ${targetY}`;

  const onPathDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const wps = [...((edge.data as any)?.waypoints || [])];
          
          // Find the best insertion index by checking distance to each segment
          let insertIdx = 0;
          let minDistance = Infinity;
          const points = [[sourceX, sourceY], ...wps, [targetX, targetY]];
          
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dist = getDistanceToSegment(pos.x, pos.y, p1[0], p1[1], p2[0], p2[1]);
            if (dist < minDistance) {
              minDistance = dist;
              insertIdx = i;
            }
          }
          
          wps.splice(insertIdx, 0, [pos.x, pos.y]);
          return {
            ...edge,
            data: { ...edge.data, waypoints: wps }
          };
        }
        return edge;
      })
    );
  };

  const onWaypointMouseDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const pos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            const wps = [...((edge.data as any)?.waypoints || [])];
            wps[idx] = [pos.x, pos.y];
            return {
              ...edge,
              data: { ...edge.data, waypoints: wps }
            };
          }
          return edge;
        })
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const onWaypointRightClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const wps = [...((edge.data as any)?.waypoints || [])];
          wps.splice(idx, 1);
          return {
            ...edge,
            data: { ...edge.data, waypoints: wps }
          };
        }
        return edge;
      })
    );
  };

  return (
    <>
      {/* Wide invisible path to make clicking easier */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={15}
        className="react-flow__edge-interaction cursor-pointer"
        onDoubleClick={onPathDoubleClick}
      />
      {/* Visible line */}
      <path
        id={id}
        d={pathD}
        fill="none"
        stroke={selected ? "#a855f7" : "#64748b"} // Purple-500 when selected, Slate-500 normal
        strokeWidth={selected ? 2.5 : 2}
        style={style}
        markerEnd={markerEnd}
        onDoubleClick={onPathDoubleClick}
      />
      {/* Waypoint handle indicators (rendered only when selected) */}
      {selected &&
        waypoints.map((wp: any, idx: number) => (
          <circle
            key={idx}
            cx={wp[0]}
            cy={wp[1]}
            r={5}
            fill="#a855f7"
            stroke="#ffffff"
            strokeWidth={1.5}
            style={{ cursor: "move" }}
            onMouseDown={(e) => onWaypointMouseDown(idx, e)}
            onContextMenu={(e) => onWaypointRightClick(idx, e)}
          >
            <title>Arraste para mover, Clique-direito para remover</title>
          </circle>
        ))}
    </>
  );
}

function getDistanceToSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
