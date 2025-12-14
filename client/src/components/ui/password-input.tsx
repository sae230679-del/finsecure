import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  showLeftIcon?: boolean;
  LeftIcon?: LucideIcon;
}

export function PasswordInput({ 
  className, 
  showLeftIcon = false,
  LeftIcon = Lock,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {showLeftIcon && (
        <LeftIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      )}
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(
          "pr-10",
          showLeftIcon && "pl-10",
          className
        )}
        {...props}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        data-testid="button-toggle-password"
        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
