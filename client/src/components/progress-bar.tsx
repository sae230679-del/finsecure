import { cn } from "@/lib/utils";
import { Check, AlertTriangle, X, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CriteriaResult } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";

type StatusType = "success" | "warning" | "critical" | "auto";
type SizeType = "sm" | "md" | "lg" | "xl";
type TrendType = "up" | "down" | "stable";
type ThemeType = "light" | "dark" | "auto";

interface TooltipOptions {
  enabled?: boolean;
  text?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface StatusProgressBarProps {
  value: number;
  status?: StatusType;
  label?: string;
  showPercent?: boolean;
  showBadge?: boolean;
  size?: SizeType;
  animated?: boolean;
  autoStatus?: boolean;
  thresholds?: { ok: number; critical: number };
  className?: string;
  ariaLabel?: string;
  badgeText?: string;
  metric?: { current: number; max: number };
  trend?: TrendType;
  onClick?: () => void;
  onChange?: (value: number) => void;
  onStatusChange?: (status: "success" | "warning" | "critical") => void;
  theme?: ThemeType;
  tooltip?: TooltipOptions;
}

const statusConfig = {
  success: {
    color: "bg-emerald-500",
    gradient: "bg-gradient-to-r from-emerald-600 to-emerald-500",
    shadow: "shadow-emerald-500/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    label: "В норме",
    icon: Check,
  },
  warning: {
    color: "bg-amber-500",
    gradient: "bg-gradient-to-r from-amber-600 to-amber-500",
    shadow: "shadow-amber-500/30",
    textColor: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    label: "Требует внимания",
    icon: AlertTriangle,
  },
  critical: {
    color: "bg-rose-500",
    gradient: "bg-gradient-to-r from-rose-600 to-rose-500",
    shadow: "shadow-rose-500/30",
    textColor: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-50 dark:bg-rose-950/30",
    label: "Критично",
    icon: X,
  },
};

const sizeConfig = {
  sm: { height: "h-1.5", radius: "rounded", text: "text-xs", padding: "p-2" },
  md: { height: "h-3", radius: "rounded-md", text: "text-sm", padding: "p-3" },
  lg: { height: "h-4", radius: "rounded-lg", text: "text-base", padding: "p-4" },
  xl: { height: "h-6", radius: "rounded-xl", text: "text-lg", padding: "p-5" },
};

function getAutoStatus(value: number, thresholds: { ok: number; critical: number }): "success" | "warning" | "critical" {
  if (value <= thresholds.ok) return "success";
  if (value >= thresholds.critical) return "critical";
  return "warning";
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export function StatusProgressBar({
  value,
  status = "auto",
  label,
  showPercent = true,
  showBadge = true,
  size = "md",
  animated = true,
  autoStatus = true,
  thresholds = { ok: 30, critical: 70 },
  className,
  ariaLabel,
  badgeText,
  metric,
  trend,
  onClick,
  onChange,
  onStatusChange,
  theme = "auto",
  tooltip = { enabled: true },
}: StatusProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const prevStatusRef = useRef<"success" | "warning" | "critical" | null>(null);
  const prevValueRef = useRef<number>(value);

  const computedStatus: "success" | "warning" | "critical" = 
    status !== "auto" 
      ? status 
      : getAutoStatus(clampedValue, thresholds);
  
  const config = statusConfig[computedStatus];
  const sizeStyles = sizeConfig[size];
  const StatusIcon = config.icon;
  const TrendIcon = trend ? trendIcons[trend] : null;

  useEffect(() => {
    if (prevValueRef.current !== value && onChange) {
      onChange(clampedValue);
    }
    prevValueRef.current = value;
  }, [value, clampedValue, onChange]);

  useEffect(() => {
    if (prevStatusRef.current !== null && prevStatusRef.current !== computedStatus && onStatusChange) {
      onStatusChange(computedStatus);
    }
    prevStatusRef.current = computedStatus;
  }, [computedStatus, onStatusChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  const themeClasses = theme === "dark" 
    ? "dark" 
    : theme === "light" 
      ? "" 
      : "";

  const progressBar = (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-secondary",
        sizeStyles.height,
        sizeStyles.radius,
        onClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "group",
        themeClasses
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || label || "Progress"}
      data-testid="status-progress-bar"
    >
      <div
        className={cn(
          "h-full",
          sizeStyles.radius,
          config.gradient,
          animated && "transition-all duration-500 ease-out",
          "group-hover:shadow-lg",
          config.shadow
        )}
        style={{ width: `${clampedValue}%` }}
      />
      {size !== "sm" && showPercent && clampedValue > 15 && (
        <span 
          className={cn(
            "absolute inset-0 flex items-center justify-center text-white font-semibold",
            size === "xl" ? "text-sm" : "text-xs"
          )}
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );

  const tooltipEnabled = tooltip?.enabled !== false;
  const tooltipText = tooltip?.text;
  const tooltipPosition = tooltip?.position || "top";

  const wrappedProgressBar = tooltipEnabled ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {progressBar}
      </TooltipTrigger>
      <TooltipContent side={tooltipPosition}>
        <div className="text-center">
          <p className="font-semibold">{tooltipText || `${Math.round(clampedValue)}%`}</p>
          {!tooltipText && <p className="text-xs text-muted-foreground">{config.label}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  ) : progressBar;

  return (
    <div className={cn("space-y-2", className)} data-testid="status-progress-container">
      {(label || metric || showPercent) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {label && (
              <span className={cn("font-medium", sizeStyles.text)} data-testid="progress-label">
                {label}
              </span>
            )}
            {metric && (
              <span className="text-muted-foreground text-sm" data-testid="progress-metric">
                {metric.current} из {metric.max}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {trend && TrendIcon && (
              <TrendIcon 
                className={cn(
                  "h-4 w-4",
                  trend === "up" && "text-rose-500",
                  trend === "down" && "text-emerald-500",
                  trend === "stable" && "text-muted-foreground"
                )} 
              />
            )}
            {(size === "sm" || clampedValue <= 15) && showPercent && (
              <span className={cn("font-semibold tabular-nums", config.textColor, sizeStyles.text)}>
                {Math.round(clampedValue)}%
              </span>
            )}
          </div>
        </div>
      )}

      {wrappedProgressBar}

      {showBadge && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              config.bgLight,
              config.textColor
            )}
            data-testid="progress-status-badge"
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {badgeText || config.label}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  completed: number;
  total: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export function ProgressBar({ completed, total, status }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {status === "processing" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Обработка... ({completed} из {total})
            </span>
          ) : status === "completed" ? (
            <span className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              Завершено
            </span>
          ) : status === "failed" ? (
            <span className="flex items-center gap-2 text-destructive">
              <X className="h-4 w-4" />
              Ошибка
            </span>
          ) : (
            "Ожидание"
          )}
        </span>
        <span className="font-medium">{percent}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            status === "failed" ? "bg-destructive" :
            status === "completed" ? "bg-green-500" :
            "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const auditStages = [
  { name: "Подключение к сайту...", duration: 3000 },
  { name: "Анализ SSL-сертификата", duration: 3500 },
  { name: "Проверка cookie-баннера", duration: 4000 },
  { name: "Поиск политики конфиденциальности", duration: 4500 },
  { name: "Анализ форм сбора данных", duration: 3500 },
  { name: "Проверка согласий ФЗ-152", duration: 5000 },
  { name: "Анализ требований ФЗ-149", duration: 4000 },
  { name: "Дополнительные проверки ФЗ-152", duration: 3500 },
  { name: "Генерация отчёта...", duration: 3000 },
];

interface AuditProgressBarProps {
  isProcessing: boolean;
  onComplete?: () => void;
}

export function AuditProgressBar({ isProcessing, onComplete }: AuditProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [activeLight, setActiveLight] = useState<"green" | "yellow" | "red">("green");
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const semaphoreRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setCurrentStage(0);
      setStageProgress(0);
      setActiveLight("green");
      elapsedRef.current = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (semaphoreRef.current) clearInterval(semaphoreRef.current);
      return;
    }

    const totalDuration = auditStages.reduce((acc, s) => acc + s.duration, 0);

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 50;
      const elapsed = elapsedRef.current;

      const newProgress = Math.min(98, (elapsed / totalDuration) * 100);
      setProgress(newProgress);

      let accumulatedTime = 0;
      for (let i = 0; i < auditStages.length; i++) {
        accumulatedTime += auditStages[i].duration;
        if (elapsed < accumulatedTime) {
          setCurrentStage(i);
          const stageStart = accumulatedTime - auditStages[i].duration;
          const stagePercent = ((elapsed - stageStart) / auditStages[i].duration) * 100;
          setStageProgress(Math.min(100, stagePercent));
          break;
        }
      }

      if (newProgress >= 98) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete?.();
      }
    }, 50);

    let lightIndex = 0;
    const lights: Array<"green" | "yellow" | "red"> = ["green", "yellow", "red"];
    semaphoreRef.current = setInterval(() => {
      lightIndex = (lightIndex + 1) % 3;
      setActiveLight(lights[lightIndex]);
      setPulseIntensity(Math.random() * 0.5 + 0.75);
    }, 400);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (semaphoreRef.current) clearInterval(semaphoreRef.current);
    };
  }, [isProcessing, onComplete]);

  const stage = auditStages[currentStage] || auditStages[auditStages.length - 1];
  const passedCount = Math.floor(progress / 10);
  const warningCount = progress > 30 ? Math.floor((progress - 30) / 20) : 0;
  const errorCount = progress > 50 ? Math.floor((progress - 50) / 25) : 0;

  return (
    <div className="space-y-6" data-testid="audit-progress-container">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border shadow-lg">
          <div 
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300",
              activeLight === "green" 
                ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" 
                : "bg-emerald-900/30"
            )}
            style={{ 
              transform: activeLight === "green" ? `scale(${pulseIntensity})` : "scale(1)",
              filter: activeLight === "green" ? "brightness(1.3)" : "brightness(0.5)"
            }}
          />
          <div 
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300",
              activeLight === "yellow" 
                ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]" 
                : "bg-amber-900/30"
            )}
            style={{ 
              transform: activeLight === "yellow" ? `scale(${pulseIntensity})` : "scale(1)",
              filter: activeLight === "yellow" ? "brightness(1.3)" : "brightness(0.5)"
            }}
          />
          <div 
            className={cn(
              "w-8 h-8 rounded-full transition-all duration-300",
              activeLight === "red" 
                ? "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]" 
                : "bg-rose-900/30"
            )}
            style={{ 
              transform: activeLight === "red" ? `scale(${pulseIntensity})` : "scale(1)",
              filter: activeLight === "red" ? "brightness(1.3)" : "brightness(0.5)"
            }}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Прогресс проверки</span>
            <span className="text-3xl font-bold tabular-nums bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="relative h-6 bg-secondary rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-20"
            />
            <div
              className="h-full rounded-full relative overflow-hidden transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                background: progress < 30 
                  ? "linear-gradient(90deg, #10b981, #34d399)" 
                  : progress < 70 
                    ? "linear-gradient(90deg, #10b981, #f59e0b)" 
                    : "linear-gradient(90deg, #10b981, #f59e0b, #f43f5e)"
              }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent animate-pulse"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="absolute inset-0 h-5 w-5 animate-ping opacity-30">
                <Loader2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="font-semibold">{stage.name}</span>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            Этап {currentStage + 1} / {auditStages.length}
          </Badge>
        </div>
        
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-200 ease-out rounded-full"
            style={{ width: `${stageProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="text-3xl font-bold text-emerald-600 tabular-nums">{passedCount}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Check className="h-3 w-3" />
              Пройдено
            </div>
          </div>
        </div>
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="text-3xl font-bold text-amber-600 tabular-nums">{warningCount}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Внимание
            </div>
          </div>
        </div>
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="text-3xl font-bold text-rose-600 tabular-nums">{errorCount}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <X className="h-3 w-3" />
              Ошибки
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

interface SemaphoreProps {
  green: number;
  yellow: number;
  red: number;
  recommendation: "excellent" | "good" | "warning" | "poor" | "critical";
}

const recommendationLabels = {
  excellent: { label: "Отлично", color: "text-green-600" },
  good: { label: "Хорошо", color: "text-green-500" },
  warning: { label: "Требует внимания", color: "text-yellow-600" },
  poor: { label: "Много ошибок", color: "text-orange-500" },
  critical: { label: "Критично", color: "text-destructive" },
};

export function Semaphore({ green, yellow, red, recommendation }: SemaphoreProps) {
  const total = green + yellow + red;
  const greenPercent = total > 0 ? (green / total) * 100 : 0;
  const yellowPercent = total > 0 ? (yellow / total) * 100 : 0;
  const redPercent = total > 0 ? (red / total) * 100 : 0;

  const recInfo = recommendationLabels[recommendation];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 h-6 rounded-full overflow-hidden bg-secondary">
        {greenPercent > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${greenPercent}%` }}
          />
        )}
        {yellowPercent > 0 && (
          <div
            className="h-full bg-yellow-500 transition-all duration-500"
            style={{ width: `${yellowPercent}%` }}
          />
        )}
        {redPercent > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${redPercent}%` }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-sm gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{Math.round(greenPercent)}% ОК</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>{Math.round(yellowPercent)}% Внимание</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>{Math.round(redPercent)}% Ошибки</span>
          </div>
        </div>
        <div className={cn("font-medium", recInfo.color)}>
          {recInfo.label}
        </div>
      </div>
    </div>
  );
}

interface CriteriaListProps {
  criteria: CriteriaResult[];
  showAll?: boolean;
}

export function CriteriaList({ criteria, showAll = false }: CriteriaListProps) {
  const displayCriteria = showAll ? criteria : criteria.slice(0, 6);

  const statusConfig = {
    passed: { icon: Check, color: "text-green-500", bg: "bg-green-500/10" },
    warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    failed: { icon: X, color: "text-red-500", bg: "bg-red-500/10" },
    pending: { icon: Loader2, color: "text-muted-foreground", bg: "bg-muted" },
  };

  return (
    <div className="space-y-2">
      {displayCriteria.map((criterion, index) => {
        const config = statusConfig[criterion.status];
        const Icon = config.icon;

        return (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg",
              config.bg
            )}
          >
            <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color, criterion.status === "pending" && "animate-spin")} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{criterion.name}</p>
              <p className="text-xs text-muted-foreground">{criterion.description}</p>
              {criterion.details && (
                <p className="text-xs mt-1 text-muted-foreground/80">{criterion.details}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
