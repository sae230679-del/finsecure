import { cn } from "@/lib/utils";

interface PaymentIconProps {
  className?: string;
}

export function SBPIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="#1D1D1D"/>
      <path d="M16 12L24 16L32 12V20L24 24L16 20V12Z" fill="#5B57A2"/>
      <path d="M24 24L32 20V28L24 32L16 28V20L24 24Z" fill="#D90751"/>
      <path d="M24 32L32 28V36L24 40L16 36V28L24 32Z" fill="#FAB718"/>
      <text x="24" y="44" textAnchor="middle" fill="white" fontSize="6" fontFamily="Arial" fontWeight="bold">СБП</text>
    </svg>
  );
}

export function SberPayIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="#21A038"/>
      <circle cx="24" cy="24" r="12" fill="none" stroke="white" strokeWidth="3"/>
      <path d="M24 14C18.48 14 14 18.48 14 24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="3" fill="white"/>
    </svg>
  );
}

export function TPayIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="#FFDD2D"/>
      <text x="24" y="30" textAnchor="middle" fill="#1A1A1A" fontSize="20" fontFamily="Arial" fontWeight="bold">T</text>
    </svg>
  );
}

export function MirPayIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="white" stroke="#E0E0E0"/>
      <path d="M8 20H12L14 28L18 20H22V32H18V24L14 32H12L8 24V32H4V20H8Z" fill="#0F754E"/>
      <path d="M24 20H28V24H32V20H36V32H32V28H28V32H24V20Z" fill="#0F754E"/>
      <path d="M38 20H44V24H38V28H44V32H38C36.9 32 36 31.1 36 30V22C36 20.9 36.9 20 38 20Z" fill="#0F754E"/>
      <path d="M8 16H40C40 16 44 18 44 20H4C4 18 8 16 8 16Z" fill="url(#mirGradient)"/>
      <defs>
        <linearGradient id="mirGradient" x1="4" y1="18" x2="44" y2="18">
          <stop stopColor="#00AEEF"/>
          <stop offset="0.5" stopColor="#006DB8"/>
          <stop offset="1" stopColor="#0F754E"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function YooMoneyIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="#8B3FFD"/>
      <circle cx="24" cy="24" r="14" fill="none" stroke="white" strokeWidth="3"/>
      <rect x="22" y="14" width="4" height="20" fill="white"/>
    </svg>
  );
}

export function MirCardIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="#FFFFFF" stroke="#E0E0E0"/>
      <path d="M6 18L10 26L14 18H18L12 32H8L2 18H6Z" fill="#0F754E"/>
      <path d="M22 18L26 26L30 18H34L28 32H24L18 18H22Z" fill="#0F754E"/>
      <rect x="36" y="18" width="8" height="14" rx="2" fill="url(#mirCardGradient)"/>
      <defs>
        <linearGradient id="mirCardGradient" x1="36" y1="18" x2="44" y2="32">
          <stop stopColor="#00AEEF"/>
          <stop offset="1" stopColor="#0F754E"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SberBusinessIcon({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="8" fill="#21A038"/>
      <circle cx="24" cy="20" r="10" fill="none" stroke="white" strokeWidth="2"/>
      <path d="M24 12C19.58 12 16 15.58 16 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="20" r="2" fill="white"/>
      <rect x="14" y="32" width="20" height="6" rx="1" fill="white"/>
      <text x="24" y="37" textAnchor="middle" fill="#21A038" fontSize="5" fontFamily="Arial" fontWeight="bold">B2B</text>
    </svg>
  );
}

export function YookassaLogo({ className }: PaymentIconProps) {
  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8", className)}
    >
      <rect x="0" y="4" width="4" height="24" rx="2" fill="#0055FF"/>
      <circle cx="16" cy="16" r="10" fill="none" stroke="#0055FF" strokeWidth="4"/>
      <text x="36" y="23" fill="currentColor" fontSize="16" fontFamily="Arial" fontWeight="500">kassa</text>
    </svg>
  );
}

export type PaymentMethodType = 
  | "sbp" 
  | "sberpay" 
  | "tpay" 
  | "mirpay" 
  | "yoomoney" 
  | "mir" 
  | "sberbusiness";

export const PAYMENT_METHODS: { 
  id: PaymentMethodType; 
  name: string; 
  description: string; 
  fee: string;
  limit: string;
  icon: React.ComponentType<PaymentIconProps>;
  isB2B?: boolean;
}[] = [
  {
    id: "sbp",
    name: "СБП",
    description: "Система быстрых платежей",
    fee: "0%",
    limit: "до 700 000 ₽",
    icon: SBPIcon,
  },
  {
    id: "sberpay",
    name: "SberPay",
    description: "Оплата через СберБанк Онлайн",
    fee: "2.8%",
    limit: "до 700 000 ₽",
    icon: SberPayIcon,
  },
  {
    id: "tpay",
    name: "T-Pay",
    description: "Оплата через Т-Банк",
    fee: "3.8%",
    limit: "до 600 000 ₽",
    icon: TPayIcon,
  },
  {
    id: "mirpay",
    name: "Mir Pay",
    description: "Оплата картой Мир через Android",
    fee: "2.8%",
    limit: "до 350 000 ₽",
    icon: MirPayIcon,
  },
  {
    id: "yoomoney",
    name: "ЮMoney",
    description: "Электронный кошелёк",
    fee: "2.8%",
    limit: "до 250 000 ₽",
    icon: YooMoneyIcon,
  },
  {
    id: "mir",
    name: "Карта Мир",
    description: "Банковская карта Мир",
    fee: "2.8%",
    limit: "до 350 000 ₽",
    icon: MirCardIcon,
  },
  {
    id: "sberbusiness",
    name: "СберБизнес",
    description: "Для юрлиц и ИП",
    fee: "индивидуально",
    limit: "до 700 000 ₽",
    icon: SberBusinessIcon,
    isB2B: true,
  },
];

interface PaymentMethodsDisplayProps {
  showLabels?: boolean;
  showB2B?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PaymentMethodsDisplay({ 
  showLabels = false, 
  showB2B = true,
  className,
  size = "md" 
}: PaymentMethodsDisplayProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const methods = showB2B 
    ? PAYMENT_METHODS 
    : PAYMENT_METHODS.filter(m => !m.isB2B);

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {methods.map((method) => (
        <div key={method.id} className="flex items-center gap-1" title={method.name}>
          <method.icon className={sizeClasses[size]} />
          {showLabels && (
            <span className="text-xs text-muted-foreground">{method.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function YookassaBadge({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground">Принимаем оплату через</span>
      <YookassaLogo className="h-5" />
    </div>
  );
}
