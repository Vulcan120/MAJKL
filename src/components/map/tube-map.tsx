'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { tubeMap } from 'd3-tube-map';
import londonRaw from '@/lib/london.json';

// ─── Types for the raw JSON ──────────────────────────────────────────────────
interface RawStation {
  name: string;
  lines: string[];
  position: number[];           // relaxed to number[]
}

interface RawLineNode {
  id: string;
  label?: string;
  marker?: boolean;
}

interface RawLine {
  name: string;
  label: string;
  color: string;
  shift?: [number, number];
  shiftCoords?: [number, number];
  nodes: (string | RawLineNode)[];
}

interface RawData {
  stations: Record<string, RawStation>;
  lines: RawLine[];
  river?: unknown;
}

// Cast the imported JSON to our typed interface
const london = londonRaw as RawData;

interface TubeMapProps {
  visitedStations: string[];
}

const TubeMapComponent: React.FC<TubeMapProps> = ({ visitedStations }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [stationCoords, setStationCoords] = useState<Record<string, { x: number; y: number }>>({});
  const { resolvedTheme } = useTheme();

  const fogColor = useMemo(
    () =>
      resolvedTheme === 'dark'
        ? 'hsl(222.2 84% 4.9% / 0.7)'
        : 'hsl(0 0% 97% / 0.7)',
    [resolvedTheme]
  );

  // 1️⃣ transform raw data into d3-tube-map format
  const formattedData = useMemo(() => {
    // keep a reference to the raw stations for lookups
    const rawStations = london.stations;

    // stations: id → { label }
    const stations = Object.fromEntries(
      Object.entries(rawStations).map(([id, st]) => [
        id,
        { label: st.name },
      ])
    );

    // lines: map nodes → coords + name + optional extras
    const lines = london.lines.map(ln => {
      const nodes = ln.nodes
        .map(node => {
          const id = typeof node === 'string' ? node : node.id;
          const st = rawStations[id];
          if (!st) {
            // skip any unknown station IDs
            console.warn(`Skipping unknown station ID: ${id}`);
            return null;
          }
          const formattedNode: any = { coords: st.position, name: id };
          if (typeof node !== 'string' && node.label) {
            formattedNode.labelPos = node.label;
          }
          if (typeof node !== 'string' && node.marker) {
            formattedNode.marker = node.marker;
          }
          return formattedNode;
        })
        .filter((n): n is { coords: number[]; name: string; labelPos?: string; marker?: boolean } => Boolean(n));

      return {
        name: ln.name,
        label: ln.label,
        color: ln.color,
        shiftCoords: ln.shift ?? ln.shiftCoords,
        nodes,
      };
    });

    return {
      stations,
      lines,
      river: london.river,
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const map = tubeMap().width(width).height(height);
    mapInstance.current = map;

    d3.select(containerRef.current).datum(formattedData).call(map);

    const renderMap = () => {
      if (!containerRef.current) return;
      map
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight);
      map.draw();

      const coords: Record<string, { x: number; y: number }> = {};
      d3.select(containerRef.current)
        .selectAll('.station')
        .each(function (d: any) {
          if (d.id) {
            const transform = d3.select(this).attr('transform') || '';
            const [x, y] = transform
              .slice(transform.indexOf('(') + 1, transform.indexOf(')'))
              .split(',')
              .map(parseFloat);
            coords[d.id] = { x, y };
          }
        });
      setStationCoords(coords);
    };

    renderMap();
    const resizeObserver = new ResizeObserver(renderMap);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll('*').remove();
      }
    };
  }, [formattedData]);

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
            {fogHoles.map((coords, i) => (
              <circle
                key={i}
                cx={coords.x}
                cy={coords.y}
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