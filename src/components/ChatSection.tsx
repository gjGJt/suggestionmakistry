import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface ChatSectionProps {
  initialQuery: string;
  isVisible: boolean;
  projectId?: string | null;
}

export function ChatSection({ initialQuery, isVisible, projectId }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: initialQuery,
      isUser: true
    },
    {
      id: "2",
      content: "I'll help you design this product! I've generated some initial brainstorming ideas in the artifacts panel. Let's start by exploring these concepts and then move into the design phase.",
      isUser: false
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I understand your feedback. Let me help you refine the design based on your input.",
          isUser: false
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-[35%] bg-background flex flex-col h-full">
      {/* Messages area with scroll */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Fixed input area at bottom */}
      <div className="p-4 border-t border-border bg-background flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}