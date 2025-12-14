import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Payment, Audit } from "@shared/schema";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type PaymentResultStatus = "loading" | "success" | "pending" | "failed";

export default function PaymentResultPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const auditId = params.get("auditId");
  
  const [resultStatus, setResultStatus] = useState<PaymentResultStatus>("loading");
  const [pollCount, setPollCount] = useState(0);

  const { data: payments, refetch: refetchPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    refetchInterval: resultStatus === "pending" ? 3000 : false,
  });

  const { data: audit } = useQuery<Audit>({
    queryKey: ["/api/audits", auditId ? parseInt(auditId) : null],
    enabled: !!auditId,
  });

  useEffect(() => {
    if (!auditId || !payments) return;

    const payment = payments.find(p => p.auditId === parseInt(auditId));
    
    if (!payment) {
      if (pollCount < 10) {
        setPollCount(prev => prev + 1);
        setResultStatus("pending");
      } else {
        setResultStatus("failed");
      }
      return;
    }

    if (payment.status === "completed") {
      setResultStatus("success");
    } else if (payment.status === "failed" || payment.status === "canceled") {
      setResultStatus("failed");
    } else {
      setResultStatus("pending");
      if (pollCount < 20) {
        setPollCount(prev => prev + 1);
      }
    }
  }, [payments, auditId, pollCount]);

  const handleRetry = () => {
    setPollCount(0);
    setResultStatus("loading");
    refetchPayments();
  };

  if (!auditId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
            <p className="text-muted-foreground mb-4">
              Не удалось определить заказ
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Вернуться в личный кабинет
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {resultStatus === "loading" && (
            <>
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </>
          )}

          {resultStatus === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Оплата прошла успешно!</h2>
              <p className="text-muted-foreground mb-6">
                Аудит вашего сайта {audit?.websiteUrlNormalized || ""} запущен. 
                Результаты будут готовы в течение нескольких минут.
              </p>
              <Button onClick={() => navigate(`/dashboard/audits/${auditId}`)} data-testid="button-go-to-audit">
                Перейти к результатам
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {resultStatus === "pending" && (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ожидание подтверждения</h2>
              <p className="text-muted-foreground mb-4">
                Платёж обрабатывается. Это может занять несколько секунд.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Проверка статуса платежа...</span>
              </div>
            </>
          )}

          {resultStatus === "failed" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Платёж не завершён</h2>
              <p className="text-muted-foreground mb-6">
                Платёж был отменён или произошла ошибка. 
                Вы можете попробовать оплатить снова.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate(`/checkout/${auditId}`)} data-testid="button-retry-payment">
                  Попробовать снова
                </Button>
                <Button variant="outline" onClick={handleRetry} data-testid="button-refresh-status">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Обновить статус
                </Button>
                <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                  Вернуться в личный кабинет
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
