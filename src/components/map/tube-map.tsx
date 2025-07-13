'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import londonData from '@/lib/london.json';

interface TubeMapProps {
  visitedStations: string[];
}

type LineRaw = {
  color: string;
  nodes: { coords: [number, number]; name: string }[];
};

const TubeMapComponent: React.FC<TubeMapProps> = ({ visitedStations }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stationCoords, setStationCoords] = useState<Record<string, { x: number; y: number }>>(
    {}
  );
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

    // clear previous
    d3.select(containerRef.current).selectAll('*').remove();

    // cast lines
    const rawLines = (londonData.lines as unknown) as LineRaw[];

    // 1️⃣ gather stationPositions from line nodes
    const stationPositions: Record<string, [number, number]> = {};
    rawLines.forEach((ln) => {
      ln.nodes.forEach((node) => {
        stationPositions[node.name] = node.coords;
      });
    });

    // 2️⃣ compute scales from those raw coords
    const allCoords = Object.values(stationPositions);
    const xs = allCoords.map((c) => c[0]);
    const ys = allCoords.map((c) => c[1]);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const xScale = d3.scaleLinear().domain([d3.min(xs)!, d3.max(xs)!]).range([20, width - 20]);
    const yScale = d3.scaleLinear().domain([d3.min(ys)!, d3.max(ys)!]).range([20, height - 20]);

    // 3️⃣ set up SVG + zoom
    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 4])
        .on('zoom', (event) => g.attr('transform', event.transform))
    );

    // 4️⃣ draw each line
    const lineGen = d3
      .line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(d3.curveLinear);

    rawLines.forEach((ln) => {
      g.append('path')
        .datum(ln.nodes.map((n) => n.coords))
        .attr('d', lineGen)
        .attr('stroke', ln.color)
        .attr('stroke-width', 4)
        .attr('fill', 'none');
    });

    // 5️⃣ draw stations & record screen coords
    const coordsMap: Record<string, { x: number; y: number }> = {};
    g.selectAll('circle.station')
      .data(Object.entries(stationPositions))
      .enter()
      .append('circle')
      .attr('class', 'station')
      .attr('cx', ([, pos]) => xScale(pos[0]))
      .attr('cy', ([, pos]) => yScale(pos[1]))
      .attr('r', 5)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .each(([id, pos]) => {
        coordsMap[id] = { x: xScale(pos[0]), y: yScale(pos[1]) };
      });

    setStationCoords(coordsMap);
  }, [resolvedTheme]);

  const fogHoles = useMemo(
    () => visitedStations.map((id) => stationCoords[id]).filter(Boolean),
    [visitedStations, stationCoords]
  );

  // Filter out undefined values in case a station ID is not found in stationCoords - this is incorrect
  const validFogHoles = fogHoles.filter(hole => hole !== undefined);

  

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
       <defs>
          <mask id="fog-mask">
            {/* Iterate through all station coordinates to create fog holes */}
            {validFogHoles.map((c, i) => {const isVisited = visitedStations.includes(
    Object.keys(stationCoords).find((key) => stationCoords[key] === c) || ''
  );
  return (
              <circle key={i} cx={c.x} cy={c.y} r={isVisited ? "55" : "50"} fill="white" filter={isVisited ? "url(#glow)" : undefined} />
            )})}
          </mask>
           <filter id="glow">
            {/* This filter creates the white glow effect */}
            <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default TubeMapComponent;