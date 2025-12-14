import { useAuth } from "@/lib/auth-context";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Shield, 
  Download, 
  Trash2, 
  Mail, 
  User, 
  Phone, 
  Building2,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function PersonalDataPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/users/me/export");
      return response.json();
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `personal-data-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Данные экспортированы",
        description: "Файл с вашими персональными данными загружен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/me");
    },
    onSuccess: async () => {
      toast({
        title: "Аккаунт удален",
        description: "Ваши персональные данные удалены. Вы будете перенаправлены на главную страницу.",
      });
      await logout();
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт. Попробуйте позже.",
        variant: "destructive",
      });
    },
  });

  const formatConsentDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    try {
      return format(new Date(date), "d MMMM yyyy 'в' HH:mm", { locale: ru });
    } catch {
      return null;
    }
  };

  const pdnConsentDate = formatConsentDate(user?.pdnConsentAt);
  const hasMarketingConsent = user?.marketingConsent === true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">
          Персональные данные и согласия
        </h1>
        <p className="text-muted-foreground mt-1">
          Здесь отображается информация о вашем согласии на обработку персональных данных и подписке на рассылки.
          Отзыв согласия и удаление аккаунта приведёт к удалению ваших персональных данных и потере доступа к личному кабинету и отчётам.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Ваши данные
            </CardTitle>
            <CardDescription>
              Персональные данные, хранящиеся в системе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ФИО</p>
                <p className="font-medium" data-testid="text-user-name">{user?.name || "Не указано"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium" data-testid="text-user-email">{user?.email || "Не указано"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-medium" data-testid="text-user-phone">{user?.phone || "Не указано"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Организация</p>
                <p className="font-medium" data-testid="text-user-company">{user?.companyName || "Не указано"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Дата регистрации</p>
                <p className="font-medium" data-testid="text-user-created">
                  {user?.createdAt 
                    ? format(new Date(user.createdAt), "d MMMM yyyy", { locale: ru })
                    : "Не указано"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Согласия
            </CardTitle>
            <CardDescription>
              Статус ваших согласий на обработку данных
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Обработка персональных данных</span>
                </div>
                {pdnConsentDate ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Дано
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Не зафиксировано
                  </Badge>
                )}
              </div>
              {pdnConsentDate && (
                <p className="text-sm text-muted-foreground ml-6" data-testid="text-pdn-consent-date">
                  Согласие дано: {pdnConsentDate}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Маркетинговые рассылки</span>
              </div>
              {hasMarketingConsent ? (
                <Badge variant="default" className="flex items-center gap-1" data-testid="badge-marketing-consent">
                  <CheckCircle className="h-3 w-3" />
                  Подписан
                </Badge>
              ) : (
                <Badge variant="secondary" data-testid="badge-marketing-consent">
                  Не подписан
                </Badge>
              )}
            </div>

            <Separator className="my-4" />

            <p className="text-sm text-muted-foreground">
              Вы можете отозвать согласие на обработку персональных данных, 
              запросив удаление учётной записи.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ваши права</CardTitle>
          <CardDescription>
            В соответствии с ФЗ-152 "О персональных данных" вы имеете следующие права
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Право на доступ</h4>
              <p className="text-sm text-muted-foreground">
                Вы можете запросить копию всех персональных данных, которые мы храним о вас.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Право на исправление</h4>
              <p className="text-sm text-muted-foreground">
                Вы можете обновить или исправить свои данные в разделе "Профиль".
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Право на удаление</h4>
              <p className="text-sm text-muted-foreground">
                Вы можете запросить удаление всех ваших персональных данных.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Право на переносимость</h4>
              <p className="text-sm text-muted-foreground">
                Вы можете экспортировать свои данные в машиночитаемом формате.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Действия с данными</CardTitle>
          <CardDescription>
            Управление вашими персональными данными
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            data-testid="button-export-data"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportMutation.isPending ? "Экспорт..." : "Экспортировать данные"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" data-testid="button-delete-account">
                <Trash2 className="h-4 w-4 mr-2" />
                Отозвать согласие и удалить аккаунт
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Удаление учётной записи
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    Это действие необратимо. При удалении аккаунта будут удалены:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Все ваши персональные данные (ФИО, email, телефон)</li>
                    <li>История аудитов и отчёты</li>
                    <li>История платежей</li>
                    <li>Доступ к личному кабинету</li>
                  </ul>
                  <p className="font-medium pt-2">
                    Вы уверены, что хотите продолжить?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Удаление..." : "Удалить аккаунт"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
