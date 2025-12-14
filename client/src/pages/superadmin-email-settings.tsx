import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, Send, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

type SystemSetting = {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
};

export default function SuperAdminEmailSettingsPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/superadmin/settings"],
  });

  const [formData, setFormData] = useState({
    smtp_host: "smtp.yandex.ru",
    smtp_port: "465",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "noreply@securelex.ru",
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
      toast({
        title: "Настройка сохранена",
        description: "Изменения успешно применены.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/superadmin/test-email", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Тестовое письмо отправлено",
        description: `Проверьте почту ${testEmail}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка отправки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveAll = () => {
    Object.entries(formData).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key, value });
    });
  };

  const handleTestEmail = () => {
    if (!testEmail) {
      toast({
        title: "Введите email",
        description: "Укажите адрес для тестового письма",
        variant: "destructive",
      });
      return;
    }
    testEmailMutation.mutate(testEmail);
  };

  const isConfigured = formData.smtp_user && formData.smtp_pass;

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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Настройки Email / SMTP</h1>
          <p className="text-muted-foreground mt-1">
            Настройка SMTP сервера для отправки email уведомлений и двухфакторной аутентификации
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
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Статус Email</CardTitle>
              {isConfigured ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Настроен
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Не настроен
                </span>
              )}
            </div>
            <CardDescription>
              {isConfigured 
                ? "SMTP сервер настроен. Двухфакторная аутентификация через Email активна."
                : "Настройте SMTP сервер для отправки писем. Без настройки двухфакторная аутентификация будет отключена."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки SMTP</CardTitle>
            <CardDescription>
              Параметры подключения к почтовому серверу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Хост</Label>
                <Input
                  id="smtp_host"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_host: e.target.value }))}
                  placeholder="smtp.yandex.ru"
                  data-testid="input-smtp-host"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Порт</Label>
                <Input
                  id="smtp_port"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_port: e.target.value }))}
                  placeholder="465"
                  data-testid="input-smtp-port"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_user">SMTP Логин (Email)</Label>
              <Input
                id="smtp_user"
                type="email"
                value={formData.smtp_user}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_user: e.target.value }))}
                placeholder="noreply@example.ru"
                data-testid="input-smtp-user"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_pass">SMTP Пароль</Label>
              <div className="relative">
                <Input
                  id="smtp_pass"
                  type={showPassword ? "text" : "password"}
                  value={formData.smtp_pass}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtp_pass: e.target.value }))}
                  placeholder="Пароль от почтового ящика"
                  data-testid="input-smtp-pass"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_from">Email отправителя</Label>
              <Input
                id="smtp_from"
                type="email"
                value={formData.smtp_from}
                onChange={(e) => setFormData(prev => ({ ...prev, smtp_from: e.target.value }))}
                placeholder="noreply@securelex.ru"
                data-testid="input-smtp-from"
              />
              <p className="text-xs text-muted-foreground">
                От чьего имени будут отправляться письма
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тестирование отправки</CardTitle>
            <CardDescription>
              Отправьте тестовое письмо для проверки настроек
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Введите email для теста"
                  data-testid="input-test-email"
                />
              </div>
              <Button 
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending || !isConfigured}
                data-testid="button-send-test"
              >
                <Send className="h-4 w-4 mr-2" />
                {testEmailMutation.isPending ? "Отправка..." : "Отправить тест"}
              </Button>
            </div>
            {!isConfigured && (
              <p className="text-sm text-muted-foreground">
                Сначала заполните и сохраните настройки SMTP
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Двухфакторная аутентификация</CardTitle>
            <CardDescription>
              Информация о работе OTP через Email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="font-medium">Как это работает:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>При входе пользователя проверяется email и пароль</li>
                <li>Если SMTP настроен, на email отправляется 6-значный код</li>
                <li>Код действителен 5 минут</li>
                <li>После ввода кода пользователь авторизуется</li>
                <li>Если SMTP не настроен, вход происходит без OTP</li>
              </ul>
            </div>
            {isConfigured ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Двухфакторная аутентификация активна</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                <span>Двухфакторная аутентификация отключена (SMTP не настроен)</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
