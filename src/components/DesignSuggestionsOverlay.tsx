import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Lightbulb, Check, ArrowRight } from 'lucide-react';
import { getDesignSuggestions, getApiKey } from '@/lib/assistantClient';

interface DesignSuggestionsOverlayProps {
  currentDesign?: string;
  context?: string;
  onSuggestionSelect?: (suggestion: string) => void;
  onClose?: () => void;
}

export default function DesignSuggestionsOverlay({ 
  currentDesign = '', 
  context = '', 
  onSuggestionSelect,
  onClose 
}: DesignSuggestionsOverlayProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getApiKey() && (currentDesign || context)) {
      loadSuggestions();
    }
  }, [currentDesign, context]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const newSuggestions = await getDesignSuggestions(currentDesign, context);
      setSuggestions(newSuggestions);
    } catch (e: any) {
      setError(e.message || 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion);
  };

  if (!getApiKey()) {
    return (
      <div className="absolute top-4 right-4 z-50">
        <Card className="w-80 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800">
              Add API key in Settings to see design suggestions.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Design Suggestions</span>
              <Badge variant="secondary" className="text-xs">
                {suggestions.length}
              </Badge>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {loading && (
            <div className="text-sm text-muted-foreground">
              Generating suggestions...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 mb-2">
              {error}
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="group cursor-pointer p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{suggestion}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && suggestions.length === 0 && !error && (
            <div className="text-sm text-muted-foreground">
              No suggestions available. Try adding more context about your design.
            </div>
          )}

          <div className="mt-3 pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSuggestions}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Refresh Suggestions'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
