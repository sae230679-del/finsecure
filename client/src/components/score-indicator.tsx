import { CheckCircle2, AlertTriangle, XCircle, Scale } from "lucide-react";

type ScoreIndicatorProps = {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

export function getScoreColor(score: number) {
  if (score >= 80) return { color: "emerald", label: "Отлично", risk: "Низкий" };
  if (score >= 60) return { color: "green", label: "Хорошо", risk: "Низкий" };
  if (score >= 40) return { color: "amber", label: "Требует внимания", risk: "Средний" };
  if (score >= 20) return { color: "orange", label: "Критично", risk: "Высокий" };
  return { color: "rose", label: "Опасно", risk: "Критический" };
}

export function ScoreIndicator({ score, size = "md", showLabel = true }: ScoreIndicatorProps) {
  const { color, label, risk } = getScoreColor(score);
  
  const sizeConfig = {
    sm: { circle: 64, stroke: 6, text: "text-lg", icon: 16 },
    md: { circle: 100, stroke: 8, text: "text-3xl", icon: 24 },
    lg: { circle: 140, stroke: 10, text: "text-4xl", icon: 32 },
  }[size];
  
  const radius = (sizeConfig.circle - sizeConfig.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const colorMap = {
    emerald: {
      stroke: "stroke-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    green: {
      stroke: "stroke-green-500",
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    amber: {
      stroke: "stroke-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    orange: {
      stroke: "stroke-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    rose: {
      stroke: "stroke-rose-500",
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-900/30",
    },
  };
  const colorClasses = colorMap[color as keyof typeof colorMap];
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: sizeConfig.circle, height: sizeConfig.circle }}>
        <svg
          className="transform -rotate-90"
          width={sizeConfig.circle}
          height={sizeConfig.circle}
        >
          <circle
            cx={sizeConfig.circle / 2}
            cy={sizeConfig.circle / 2}
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth={sizeConfig.stroke}
          />
          <circle
            cx={sizeConfig.circle / 2}
            cy={sizeConfig.circle / 2}
            r={radius}
            className={`${colorClasses.stroke} fill-none transition-all duration-700 ease-out`}
            strokeWidth={sizeConfig.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${sizeConfig.text} ${colorClasses.text}`}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <div className={`text-sm font-semibold ${colorClasses.text}`}>{label}</div>
          <div className="text-xs text-muted-foreground">Риск: {risk}</div>
        </div>
      )}
    </div>
  );
}

type FineEstimateProps = {
  failedCount: number;
  warningCount: number;
  severity: "low" | "medium" | "high";
};

export function FineEstimate({ failedCount, warningCount, severity }: FineEstimateProps) {
  const baseFinePhysical = failedCount * 3000 + warningCount * 1000;
  const baseFineEntity = failedCount * 50000 + warningCount * 15000;
  
  const multiplierMap = {
    low: 1,
    medium: 1.5,
    high: 2.5,
  };
  const multiplier = multiplierMap[severity] || 1;
  
  const maxPhysical = Math.min(Math.round(baseFinePhysical * multiplier), 300000);
  const maxEntity = Math.min(Math.round(baseFineEntity * multiplier), 18000000);
  
  const formatFine = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} млн`;
    }
    return new Intl.NumberFormat("ru-RU").format(amount);
  };
  
  const severityMap = {
    low: { text: "Низкий", color: "text-emerald-600 dark:text-emerald-400" },
    medium: { text: "Средний", color: "text-amber-600 dark:text-amber-400" },
    high: { text: "Высокий", color: "text-rose-600 dark:text-rose-400" },
  };
  const severityText = severityMap[severity] || severityMap.low;
  
  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Scale className="h-4 w-4" />
        Потенциальные штрафы (КоАП РФ)
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-md bg-background">
          <div className="text-xs text-muted-foreground mb-1">Для физ. лиц</div>
          <div className="text-lg font-bold">до {formatFine(maxPhysical)} ₽</div>
        </div>
        <div className="p-3 rounded-md bg-background">
          <div className="text-xs text-muted-foreground mb-1">Для юр. лиц</div>
          <div className="text-lg font-bold">до {formatFine(maxEntity)} ₽</div>
        </div>
      </div>
      
      <div className="text-center text-sm">
        Уровень риска:{" "}
        <span className={`font-semibold ${severityText.color}`}>
          {severityText.text}
        </span>
      </div>
    </div>
  );
}

type ResultsSummaryProps = {
  passedCount: number;
  warningCount: number;
  failedCount: number;
};

export function ResultsSummary({ passedCount, warningCount, failedCount }: ResultsSummaryProps) {
  const total = passedCount + warningCount + failedCount;
  
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-col items-center p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{passedCount}</span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">Пройдено</span>
      </div>
      <div className="flex flex-col items-center p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-1" />
        <span className="text-xl font-bold text-amber-700 dark:text-amber-300">{warningCount}</span>
        <span className="text-xs text-amber-600 dark:text-amber-400">Внимание</span>
      </div>
      <div className="flex flex-col items-center p-3 rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
        <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mb-1" />
        <span className="text-xl font-bold text-rose-700 dark:text-rose-300">{failedCount}</span>
        <span className="text-xs text-rose-600 dark:text-rose-400">Ошибки</span>
      </div>
    </div>
  );
}
