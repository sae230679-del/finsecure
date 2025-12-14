import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Wallet, Link as LinkIcon } from "lucide-react";
import type { Referral } from "@shared/schema";

export default function ReferralPage() {
  const { toast } = useToast();

  const { data: referral, isLoading } = useQuery<Referral>({
    queryKey: ["/api/referral"],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Реферальная ссылка скопирована в буфер обмена",
    });
  };

  const referralLink = referral ? `${window.location.origin}?ref=${referral.referralCode}` : "";

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Реферальная программа</h1>
        <p className="text-muted-foreground">
          Приглашайте друзей и получайте бонусы за каждую их покупку
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Статус</CardTitle>
              <CardDescription>Реферальная программа</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant={referral?.status === "active" ? "default" : "secondary"} data-testid="text-status">
              {referral?.status === "active" ? "Активна" : "Неактивна"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Заработано</CardTitle>
              <CardDescription>Общий бонус</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold" data-testid="text-total-earnings">
              {(referral?.earningsTotal || 0).toLocaleString("ru-RU")} 
            </span>
            <span className="text-muted-foreground ml-1">RUB</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Ваша реферальная ссылка
          </CardTitle>
          <CardDescription>
            Поделитесь этой ссылкой с друзьями. Вы получите 10% от каждой их покупки.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
              data-testid="input-referral-link"
            />
            <Button 
              onClick={() => copyToClipboard(referralLink)}
              variant="outline"
              data-testid="button-copy-link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ваш код:</span>
            <Badge variant="outline" data-testid="text-referral-code">
              {referral?.referralCode}
            </Badge>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => copyToClipboard(referral?.referralCode || "")}
              data-testid="button-copy-code"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Как это работает?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li>Поделитесь своей реферальной ссылкой с друзьями и коллегами</li>
            <li>Когда они зарегистрируются по вашей ссылке, они получат скидку 5% на первый заказ</li>
            <li>Вы получите 10% от суммы каждой их покупки на свой бонусный счет</li>
            <li>Бонусы можно использовать для оплаты собственных проверок</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
