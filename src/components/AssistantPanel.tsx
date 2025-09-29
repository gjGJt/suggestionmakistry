import React, { useMemo, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { chatWithAssistant, type ChatMessage, getApiKey } from '@/lib/assistantClient';

export default function AssistantPanel() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const apiKeyPresent = useMemo(() => !!getApiKey(), []);

  async function onSend() {
    if (!input.trim()) return;
    setError(null);
    setLoading(true);
    const nextHistory = [...history, { role: 'user', content: input }];
    setHistory(nextHistory);
    setInput('');
    try {
      const reply = await chatWithAssistant(input, history);
      setHistory([...nextHistory, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message || 'Failed to contact assistant');
      setHistory(history); // revert
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {!apiKeyPresent && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-800">
            Add your API key in Settings to enable the CadQuery assistant.
          </div>
        </Card>
      )}
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {history.length === 0 ? (
          <div className="text-muted-foreground text-sm space-y-2">
            <p className="font-medium">Ask CadQuery questions like:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Create a 40x20x10 box with filleted edges and a 5mm through-hole</li>
              <li>How to export to STEP?</li>
              <li>Suggest follow-up questions for a parametric phone stand</li>
              <li>What are the best practices for fillet radius selection?</li>
            </ul>
          </div>
        ) : (
          history.map((m, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">
                  {m.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {error && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="text-sm text-red-800">{error}</div>
        </Card>
      )}
      
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about CadQuery modeling..."
          className="flex-1 min-h-[60px] resize-none"
          disabled={loading}
        />
        <Button 
          onClick={onSend} 
          disabled={loading || !apiKeyPresent || !input.trim()}
          size="sm"
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
