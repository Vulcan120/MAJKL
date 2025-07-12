'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
// @ts-ignore
import { tubeMap } from 'd3-tube-map';

interface TubeMapProps {
  visitedStations: string[];
}

const TubeMapComponent: React.FC<TubeMapProps> = ({ visitedStations }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [stationCoords, setStationCoords] = useState<Record<string, { x: number; y: number }>>({});
  const { resolvedTheme } = useTheme();

  const fogColor = useMemo(() => {
    return resolvedTheme === 'dark' ? 'hsl(222.2 84% 4.9% / 0.7)' : 'hsl(0 0% 97% / 0.7)';
  }, [resolvedTheme]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = tubeMap(d3.select(containerRef.current));
    mapInstance.current = map;

    d3.json('https://raw.githubusercontent.com/d3-tube-map/d3-tube-map.github.io/main/dist/data/london.json').then((data: any) => {
      map.data(data);
      const renderMap = () => {
        if (!containerRef.current) return;
        map.width(containerRef.current.clientWidth).height(containerRef.current.clientHeight);
        map.draw();

        const coords: Record<string, { x: number; y: number }> = {};
        d3.select(containerRef.current)
          .selectAll('.station')
          .each(function (d: any) {
            if (d.id) {
              const transform = d3.select(this).attr('transform');
              if (transform) {
                const translate = transform.substring(transform.indexOf('(') + 1, transform.indexOf(')')).split(',');
                coords[d.id] = { x: parseFloat(translate[0]), y: parseFloat(translate[1]) };
              }
            }
          });
        setStationCoords(coords);
      };
      
      renderMap();
      window.addEventListener('resize', renderMap);

      return () => {
        window.removeEventListener('resize', renderMap);
        if (containerRef.current) {
          d3.select(containerRef.current).selectAll('*').remove();
        }
      };
    });
  }, []);
  
  const fogHoles = useMemo(() => {
    return visitedStations.map(id => stationCoords[id]).filter(Boolean);
  }, [visitedStations, stationCoords]);

  return (
    <div className="w-full h-full relative" >
      <div ref={containerRef} className="w-full h-full" />
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <defs>
          <mask id="fog-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {fogHoles.map((coords, i) => (
              <circle key={i} cx={coords.x} cy={coords.y} r="40" fill="black" className="transition-all duration-1000" />
            ))}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={fogColor} mask="url(#fog-mask)" className="transition-opacity duration-1000" />
      </svg>
    </div>
  );
};

export default TubeMapComponent;
