import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface LineData {
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
    <div className="bg-card p-4 shadow-lg overflow-y-auto lg:h-full lg:w-full">
      <Collapsible className="lg:h-full lg:w-full">
        <CollapsibleTrigger className="flex items-center justify-between w-full lg:pointer-events-none">
          <h3 className="text-lg font-semibold mb-4 lg:mb-0">Tube Lines Key</h3>
          <span className="lg:hidden">&#9660;</span> {/* Down arrow for mobile */}
        </CollapsibleTrigger>
        <CollapsibleContent className="lg:h-full lg:w-full">
          <ul className="mt-4 lg:mt-0">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
 );
};

export default TubeLineKey;