import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeManager } from "@/lib/theme-manager";

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useThemeManager();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleColorMode}
      data-testid="button-color-mode-toggle"
    >
      {colorMode === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">
        {colorMode === "light" ? "Тёмная тема" : "Светлая тема"}
      </span>
    </Button>
  );
}
