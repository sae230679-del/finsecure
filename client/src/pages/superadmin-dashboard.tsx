import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Users, 
  Settings, 
  Palette, 
  FileText, 
  TrendingUp, 
  CreditCard, 
  Activity, 
  Crown, 
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatPrice } from "@/lib/packages-data";

type SuperAdminStats = {
  revenue: number;
  totalPayments: number;
  activeAudits: number;
  totalUsers: number;
  adminCount: number;
};

export default function SuperAdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<SuperAdminStats>({
    queryKey: ["/api/superadmin/stats"],
  });

  const statCards = [
    {
      title: "Выручка",
      value: formatPrice(stats?.revenue || 0),
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Платежей",
      value: stats?.totalPayments || 0,
      icon: CreditCard,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Пользователей",
      value: stats?.totalUsers || 0,
      icon: Users,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Активных аудитов",
      value: stats?.activeAudits || 0,
      icon: Activity,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  const quickLinks = [
    {
      title: "Пользователи",
      description: "Управление всеми пользователями и ролями",
      icon: Users,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      href: "/superadmin/users",
    },
    {
      title: "Настройки",
      description: "Название сайта и системные параметры",
      icon: Settings,
      iconBg: "bg-slate-500/10",
      iconColor: "text-slate-600 dark:text-slate-400",
      href: "/superadmin/settings",
    },
    {
      title: "Темы дизайна",
      description: "Настройка цветовых схем платформы",
      icon: Palette,
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-600 dark:text-pink-400",
      href: "/superadmin/themes",
    },
    {
      title: "Журнал действий",
      description: "История всех административных действий",
      icon: FileText,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      href: "/superadmin/logs",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            Панель супер-администратора
          </h1>
          <p className="text-muted-foreground mt-1">
            Полный контроль над платформой SecureLex.ru
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/settings">
            <Settings className="mr-2 h-4 w-4" />
            Настройки
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`text-stat-${index}`}>
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Card key={index} className="hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${link.iconBg}`}>
                    <link.icon className={`h-5 w-5 ${link.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2">{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={link.href}>
                    Перейти
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle>Режим супер-администратора</CardTitle>
              <CardDescription>
                У вас есть полный доступ ко всем функциям платформы
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">Панель админа</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Панель пользователя</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
