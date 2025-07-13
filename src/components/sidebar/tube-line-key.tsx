import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrainFrontTunnel } from "lucide-react";

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
  // Sort lines by name for consistent display
  const sortedLines = [...lineData].sort((a, b) =>
    a.formattedName.localeCompare(b.formattedName)
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrainFrontTunnel className="w-5 h-5 text-primary" />
          Tube Lines
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)] px-6">
          <div className="space-y-3 pb-4">
            {sortedLines.map((line) => (
              <div
                key={line.name}
                className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50"
              >
                {/* Line color indicator */}
                <div className="flex-shrink-0 relative">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                    style={{ backgroundColor: line.color }}
                  />
                  <div
                    className="absolute inset-0 w-4 h-4 rounded-full opacity-20"
                    style={{ backgroundColor: line.color }}
                  />
                </div>

                {/* Line info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm truncate">
                      {line.formattedName}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-xs ml-2 flex-shrink-0"
                      style={{
                        backgroundColor: `${line.color}20`,
                        borderColor: `${line.color}40`,
                        color: line.color,
                      }}
                    >
                      {line.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {line.count} stations
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TubeLineKey;
