import { PACKAGES_DATA, formatPrice, formatDuration, type PackageType } from "@/lib/packages-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, ListChecks, Sparkles } from "lucide-react";

interface PackageSelectorProps {
  value: PackageType;
  onChange: (value: PackageType) => void;
  disabled?: boolean;
  showDetails?: boolean;
}

export function PackageSelector({ value, onChange, disabled, showDetails = true }: PackageSelectorProps) {
  const selectedPackage = PACKAGES_DATA[value];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Label htmlFor="package-type" className="text-sm font-medium">
            Тип сайта
          </Label>
          <label 
            className="flex items-center gap-1.5 text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => !disabled && onChange("other")}
            data-testid="select-type-all-dashboard"
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              value === "other" 
                ? "border-primary bg-primary" 
                : "border-muted-foreground/50"
            }`}>
              {value === "other" && (
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>Не знаю / Выбрать все</span>
          </label>
        </div>
        <Select
          value={value}
          onValueChange={(v) => onChange(v as PackageType)}
          disabled={disabled}
        >
          <SelectTrigger id="package-type" className="w-full" data-testid="select-package-type">
            <SelectValue placeholder="Выберите тип сайта" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PACKAGES_DATA).map(([key, pkg]) => (
              <SelectItem key={key} value={key} data-testid={`select-option-${key}`}>
                <div className="flex items-center gap-2">
                  <span>{pkg.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({formatPrice(pkg.price)})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDetails && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-2xl font-bold" data-testid="text-package-price">
                    {formatPrice(selectedPackage.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                </div>
                {value === "premium" && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Премиум
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-criteria-count">
                    {selectedPackage.criteriaCount} критериев
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-duration">
                    {formatDuration(selectedPackage.durationMin, selectedPackage.durationMax)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Включено в проверку:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
