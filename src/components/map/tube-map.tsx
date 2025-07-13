'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import londonData from '@/lib/london.json';

interface TubeMapProps {
  visitedStations: string[];
}

// --- Casted types for easy indexing ---
type StationRaw = { name: string; lines: string[]; position: number[] };
type LineRaw = {
  name: string;
  label: string;
  color: string;
  nodes: (string | { id: string; label?: string; marker?: boolean })[];
};

const stations = londonData.stations as Record<string, StationRaw>;
const lines = londonData.lines as LineRaw[];

const TubeMapComponent: React.FC<TubeMapProps> = ({ visitedStations }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stationCoords, setStationCoords] = useState<Record<string, { x: number; y: number }>>({});
  const { resolvedTheme } = useTheme();

  const fogColor = useMemo(
    () =>
      resolvedTheme === 'dark'
        ? 'hsl(222.2 84% 4.9% / 0.7)'
        : 'hsl(0 0% 97% / 0.7)',
    [resolvedTheme]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    // clear any prior SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // scales to map raw coords → screen coords
    const allX = Object.values(stations).map(s => s.position[0]);
    const allY = Object.values(stations).map(s => s.position[1]);
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(allX)!, d3.max(allX)!])
      .range([20, width - 20]);
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allY)!, d3.max(allY)!])
      .range([20, height - 20]);

    const lineGen = d3
      .line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveLinear);

    // draw each line, skipping any unknown station IDs
    lines.forEach(ln => {
      const pts: [number, number][] = ln.nodes
        .map(node => {
          const id = typeof node === 'string' ? node : node.id;
          const st = stations[id];
          if (!st) {
            console.warn(`Skipping unknown station ID: ${id}`);
            return null;
          }
          return [st.position[0], st.position[1]] as [number, number];
        })
        .filter((p): p is [number, number] => Boolean(p));

      svg
        .append('path')
        .datum(pts)
        .attr('d', lineGen)
        .attr('stroke', ln.color)
        .attr('stroke-width', 4)
        .attr('fill', 'none');
    });

    // draw stations and record their pixel coords
    const coordsMap: Record<string, { x: number; y: number }> = {};
    svg
      .selectAll('circle.station')
      .data(Object.entries(stations))
      .enter()
      .append('circle')
      .attr('class', 'station')
      .attr('cx', ([, s]) => xScale(s.position[0]))
      .attr('cy', ([, s]) => yScale(s.position[1]))
      .attr('r', 6)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .each(function ([id, s]) {
        coordsMap[id] = { x: xScale(s.position[0]), y: yScale(s.position[1]) };
      });

    setStationCoords(coordsMap);
  }, [resolvedTheme]);

  // build fog-mask holes
  const fogHoles = useMemo(
    () => visitedStations.map(id => stationCoords[id]).filter(Boolean),
    [visitedStations, stationCoords]
  );

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <defs>
          <mask id="fog-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {fogHoles.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="40"
                fill="black"
                className="transition-all duration-1000"
              />
            ))}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={fogColor}
          mask="url(#fog-mask)"
          className="transition-opacity duration-1000"
        />
      </svg>
    </div>
  );
};

export default TubeMapComponent;
