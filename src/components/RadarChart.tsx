import React from 'react';

interface RadarChartProps {
  data: {
    Builder: number;
    Innovator: number;
    Researcher: number;
    Leader: number;
    Collaborator: number;
    ProblemSolver: number;
  };
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const width = 340;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const r = 90; // max radius

  const dimensions = [
    { key: 'Builder', label: 'Builder' },
    { key: 'Innovator', label: 'Innovator' },
    { key: 'Researcher', label: 'Researcher' },
    { key: 'Leader', label: 'Leader' },
    { key: 'Collaborator', label: 'Collaborator' },
    { key: 'ProblemSolver', label: 'Problem Solver' },
  ];

  // Calculate coordinates for a given value (0 to 100) and angle index
  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    const distance = (value / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate grid circles/polygons
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((level) => {
    const points = dimensions.map((_, index) => {
      const { x, y } = getCoordinates(index, level);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // Calculate coordinates for the candidate's actual values
  const candidatePoints = dimensions.map((d, index) => {
    const val = data[d.key as keyof typeof data] || 0;
    const { x, y } = getCoordinates(index, val);
    return `${x},${y}`;
  }).join(' ');

  // Calculate coordinate for dimension label placements
  const getLabelCoords = (index: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    // Offset labels slightly outwards from maximum radius
    const labelRadius = r + 25;
    const x = cx + labelRadius * Math.cos(angle);
    const y = cy + labelRadius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Outer Circular Glow Backing */}
        <circle cx={cx} cy={cy} r={r} fill="url(#radarGlow)" />

        {/* Grid Web Polygons */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Radar Axis Lines */}
        {dimensions.map((_, index) => {
          const outer = getCoordinates(index, 100);
          return (
            <line
              key={index}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Candidate Value Polygon Area */}
        <polygon
          points={candidatePoints}
          fill="url(#areaGradient)"
          stroke="var(--color-secondary)"
          strokeWidth="2"
          filter="drop-shadow(0px 0px 8px var(--color-secondary-glow))"
          style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Value Data Points */}
        {dimensions.map((d, index) => {
          const val = data[d.key as keyof typeof data] || 0;
          const { x, y } = getCoordinates(index, val);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="var(--text-primary)"
              stroke="var(--color-primary)"
              strokeWidth="2"
              style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          );
        })}

        {/* Labels */}
        {dimensions.map((d, index) => {
          const { x, y } = getLabelCoords(index);
          const val = data[d.key as keyof typeof data] || 0;
          
          // Determine text anchor based on side
          let textAnchor: 'middle' | 'end' | 'start' = 'middle';
          if (x < cx - 10) textAnchor = 'end';
          if (x > cx + 10) textAnchor = 'start';

          // Vertically align top/bottom labels
          let dy = '0.35em';
          if (index === 0) dy = '-0.4em';
          if (index === 3) dy = '1.2em';

          return (
            <g key={index}>
              <text
                x={x}
                y={y}
                dy={dy}
                textAnchor={textAnchor}
                fill="var(--text-secondary)"
                fontSize="11px"
                fontWeight="500"
                fontFamily="var(--font-sans)"
              >
                {d.label}
              </text>
              <text
                x={x}
                y={y + 13}
                dy={dy}
                textAnchor={textAnchor}
                fill="var(--color-secondary)"
                fontSize="11px"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                {val}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
