import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardData } from "./BrainstormView";

interface Props {
  cards: CardData[];
}

export default function ConstraintsView({ cards }: Props) {
  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 gap-4 pr-4">
        {cards.map(({ title, description }, idx) => (
          <Card key={idx} className="bg-background">
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
