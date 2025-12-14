import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, AlertCircle, Check } from "lucide-react";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function URLInput({ value, onChange, error, disabled }: URLInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isValidURL = (url: string) => {
    if (!url) return null;
    const pattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
    return pattern.test(url);
  };

  const validation = isValidURL(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="website-url" className="text-sm font-medium">
        URL сайта
      </Label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="website-url"
          type="text"
          placeholder="example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="pl-10 pr-10 font-mono text-sm"
          data-testid="input-website-url"
        />
        {value && !isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validation ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Можно вводить: example.com, www.example.com или https://example.com
      </p>
    </div>
  );
}
