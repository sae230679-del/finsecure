import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard, CheckCircle, XCircle, Eye, EyeOff, TestTube, AlertTriangle } from "lucide-react";

type SystemSetting = {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
};

export default function SuperAdminPaymentSettingsPage() {
  const { toast } = useToast();
  const [showSecretKey, setShowSecretKey] = useState(false);

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/superadmin/settings"],
  });

  const [formData, setFormData] = useState({
    yookassa_shop_id: "",
    yookassa_secret_key: "",
    yookassa_enabled: "false",
    yookassa_test_mode: "true",
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(prev => {
        const updated = { ...prev };
        settings.forEach((setting) => {
          if (setting.key in updated) {
            (updated as any)[setting.key] = setting.value;
          }
        });
        return updated;
      });
      setIsHydrated(true);
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/superadmin/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/superadmin/test-yookassa");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Подключение успешно",
        description: data.message || "ЮKassa API доступен",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка подключения",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveAll = async () => {
    try {
      await Promise.all(
        Object.entries(formData).map(([key, value]) =>
          updateSettingMutation.mutateAsync({ key, value })
        )
      );
      toast({
        title: "Настройки сохранены",
        description: "Все изменения успешно применены.",
      });
    } catch (error) {
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    setFormData(prev => ({ ...prev, yookassa_enabled: checked ? "true" : "false" }));
  };

  const handleToggleTestMode = (checked: boolean) => {
    setFormData(prev => ({ ...prev, yookassa_test_mode: checked ? "true" : "false" }));
  };

  const isConfigured = formData.yookassa_shop_id && formData.yookassa_secret_key;
  const isEnabled = formData.yookassa_enabled === "true";
  const isTestMode = formData.yookassa_test_mode === "true";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Настройки платежей</h1>
          <p className="text-muted-foreground mt-1">
            Интеграция с ЮKassa для приема платежей
          </p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={updateSettingMutation.isPending || !isHydrated}
          data-testid="button-save-all"
        >
          <Save className="h-4 w-4 mr-2" />
          Сохранить все
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Статус ЮKassa</CardTitle>
              {isConfigured && isEnabled ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Активна
                </Badge>
              ) : isConfigured ? (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Отключена
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Не настроена
                </Badge>
              )}
              {isTestMode && isConfigured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  <TestTube className="h-3 w-3 mr-1" />
                  Тестовый режим
                </Badge>
              )}
            </div>
            <CardDescription>
              {isConfigured && isEnabled
                ? "Платежная система подключена и готова к приему платежей."
                : isConfigured
                  ? "API ключи настроены, но прием платежей отключен."
                  : "Введите Shop ID и секретный ключ из личного кабинета ЮKassa."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API ключи ЮKassa</CardTitle>
            <CardDescription>
              Данные для подключения к платежной системе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yookassa_shop_id">Shop ID</Label>
              <Input
                id="yookassa_shop_id"
                value={formData.yookassa_shop_id}
                onChange={(e) => setFormData(prev => ({ ...prev, yookassa_shop_id: e.target.value }))}
                placeholder="123456"
                data-testid="input-shop-id"
              />
              <p className="text-xs text-muted-foreground">
                Идентификатор магазина из личного кабинета ЮKassa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yookassa_secret_key">Секретный ключ</Label>
              <div className="relative">
                <Input
                  id="yookassa_secret_key"
                  type={showSecretKey ? "text" : "password"}
                  value={formData.yookassa_secret_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, yookassa_secret_key: e.target.value }))}
                  placeholder="live_xxxxxxxxxxxxxxxxxx"
                  data-testid="input-secret-key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  data-testid="button-toggle-secret"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Секретный ключ для API авторизации
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => testConnectionMutation.mutate()}
                disabled={!isConfigured || testConnectionMutation.isPending}
                data-testid="button-test-connection"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testConnectionMutation.isPending ? "Проверка..." : "Проверить подключение"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Режим работы</CardTitle>
            <CardDescription>
              Управление приемом платежей
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Прием платежей</Label>
                <p className="text-sm text-muted-foreground">
                  Включить или отключить прием платежей через ЮKassa
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
                disabled={!isConfigured}
                data-testid="switch-enabled"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Тестовый режим</Label>
                <p className="text-sm text-muted-foreground">
                  Используйте тестовые ключи для проверки интеграции
                </p>
              </div>
              <Switch
                checked={isTestMode}
                onCheckedChange={handleToggleTestMode}
                data-testid="switch-test-mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты</CardTitle>
            <CardDescription>
              Поддерживаемые способы оплаты через ЮKassa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">СБП</span>
                </div>
                <div>
                  <p className="text-sm font-medium">СБП</p>
                  <p className="text-xs text-green-600">0% комиссии</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div>
                  <p className="text-sm font-medium">SberPay</p>
                  <p className="text-xs text-muted-foreground">2.8%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                  <span className="text-black text-xs font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm font-medium">T-Pay</p>
                  <p className="text-xs text-muted-foreground">3.8%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 via-blue-600 to-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Mir</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Mir Pay</p>
                  <p className="text-xs text-muted-foreground">2.8%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Ю</span>
                </div>
                <div>
                  <p className="text-sm font-medium">ЮMoney</p>
                  <p className="text-xs text-muted-foreground">2.8%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B2B</span>
                </div>
                <div>
                  <p className="text-sm font-medium">СберБизнес</p>
                  <p className="text-xs text-muted-foreground">B2B</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
            <CardDescription>
              URL для получения уведомлений о платежах от ЮKassa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <code className="text-sm break-all" data-testid="text-webhook-url">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/yookassa/webhook` : '/api/yookassa/webhook'}
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              Добавьте этот URL в настройках HTTP-уведомлений в личном кабинете ЮKassa.
              Выберите события: payment.succeeded, payment.canceled, refund.succeeded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Инструкция по подключению</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Зарегистрируйтесь в <a href="https://yookassa.ru" target="_blank" rel="noopener noreferrer" className="text-primary underline">ЮKassa</a> и создайте магазин</li>
              <li>В личном кабинете ЮKassa перейдите в раздел "Интеграция" -&gt; "Ключи API"</li>
              <li>Скопируйте Shop ID и создайте секретный ключ</li>
              <li>Вставьте данные в форму выше и сохраните</li>
              <li>Добавьте Webhook URL в настройках ЮKassa</li>
              <li>Проверьте подключение и включите прием платежей</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
