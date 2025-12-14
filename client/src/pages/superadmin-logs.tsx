import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, User, Package, Palette, Settings, Shield } from "lucide-react";

type AuditLog = {
  id: number;
  userId: number | null;
  action: string;
  resourceType: string | null;
  resourceId: number | null;
  details: string | null;
  createdAt: string;
};

export default function SuperAdminLogsPage() {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/superadmin/logs"],
  });

  const getActionBadge = (action: string) => {
    if (action.includes("delete")) {
      return <Badge variant="destructive">{formatAction(action)}</Badge>;
    }
    if (action.includes("create")) {
      return <Badge className="bg-green-500/10 text-green-600">{formatAction(action)}</Badge>;
    }
    if (action.includes("update") || action.includes("change")) {
      return <Badge variant="secondary">{formatAction(action)}</Badge>;
    }
    if (action.includes("activate")) {
      return <Badge className="bg-blue-500/10 text-blue-600">{formatAction(action)}</Badge>;
    }
    return <Badge variant="outline">{formatAction(action)}</Badge>;
  };

  const formatAction = (action: string): string => {
    const actions: Record<string, string> = {
      update_package: "Обновление пакета",
      change_user_role: "Изменение роли",
      delete_user: "Удаление пользователя",
      update_setting: "Изменение настройки",
      create_theme: "Создание темы",
      update_theme: "Обновление темы",
      activate_theme: "Активация темы",
    };
    return actions[action] || action;
  };

  const getResourceIcon = (resourceType: string | null) => {
    switch (resourceType) {
      case "user":
        return <User className="h-4 w-4 text-muted-foreground" />;
      case "package":
        return <Package className="h-4 w-4 text-muted-foreground" />;
      case "theme":
        return <Palette className="h-4 w-4 text-muted-foreground" />;
      case "setting":
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseDetails = (details: string | null): string => {
    if (!details) return "-";
    try {
      const parsed = JSON.parse(details);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Журнал действий</h1>
        <p className="text-muted-foreground mt-1">
          История всех административных действий на платформе
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Последние действия
          </CardTitle>
          <CardDescription>
            Отображаются последние 100 записей
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Ресурс</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Детали</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(log.resourceType)}
                        <span className="capitalize">{log.resourceType || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.resourceId ? (
                        <Badge variant="outline">#{log.resourceId}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {parseDetails(log.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет записей</h3>
              <p className="text-muted-foreground">
                Журнал действий пуст
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
