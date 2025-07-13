import React from 'react';

interface LineData {
  name: string;
  color: string;
  count: number;
  formattedName: string;
}

interface TubeLineKeyProps {
  lineData: LineData[];
}

const TubeLineKey: React.FC<TubeLineKeyProps> = ({ lineData }) => {
  return (
    <div className="h-full w-full bg-card p-4 shadow-lg overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Tube Lines Key</h3>
      <ul>
        {lineData.map((line) => (
          <li key={line.name} className="flex items-center gap-2 mb-2 text-sm">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: line.color }}
            ></span>
            <span className="flex-grow truncate">{line.formattedName}</span>
            <span className="text-muted-foreground">
              ({line.count} stations)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TubeLineKey;