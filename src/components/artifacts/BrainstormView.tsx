import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BrainstormJSON } from "@/hooks/useBrainstorm";

interface Props {
  brainstorm: BrainstormJSON | null;
}

export default function BrainstormView({ brainstorm }: Props) {
  if (!brainstorm) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        ← Submit a prompt to start brainstorming
      </div>
    );
  }

  const sections = [
    { title: "Key Features",        list: brainstorm.key_features },
    { title: "Key Functionalities", list: brainstorm.key_functionalities },
    { title: "Design Components",   list: brainstorm.design_components },
  ] as const;

  const kvSections = [
    { title: "Optimal Geometry",        dict: brainstorm.optimal_geometry },
  ] as const;

  return (
    <ScrollArea className="h-full pr-4">
      {/* one-liner on top */}
      <Card className="mb-4 bg-background">
        <CardHeader>
          <CardTitle className="text-base">Design One-Liner</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{brainstorm.design_one_liner}</CardDescription>
        </CardContent>
      </Card>

      {/* grid for everything else */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ title, list }) => (
          <Card key={title} className="bg-background">
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
        {/* key-value sections */}
        {kvSections.map(({ title, dict }) => (
          <Card key={title} className="bg-background">
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="pl-0 space-y-1">
                {Object.entries(dict).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="font-medium">{k}</span>
                    <span>{String(v)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
