import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getApiKey, saveApiKey } from '@/lib/assistantClient';

export default function SettingsPanel() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(getApiKey());
  }, []);

  function onSave() {
    saveApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Assistant Settings</CardTitle>
          <CardDescription>
            Configure your CadQuery assistant API key for AI-powered design suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <p className="text-sm text-muted-foreground">
              The key is stored locally in your browser and used to call the model provider API.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Supported Providers</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• OpenAI (GPT-4, GPT-4o-mini)</p>
              <p>• Anthropic Claude</p>
              <p>• Any OpenAI-compatible API</p>
            </div>
          </div>
          
          <Button onClick={onSave} className="w-full">
            {saved ? 'Saved!' : 'Save API Key'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
