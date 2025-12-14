import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Tag, Users, Calendar, Percent, Banknote, Eye } from "lucide-react";
import { formatPrice } from "@/lib/packages-data";

type PromoCode = {
  id: number;
  code: string;
  discountType: "percent" | "amount";
  discountPercent: number | null;
  discountAmount: number | null;
  appliesTo: "all" | "packages" | "reports";
  appliesToIds: number[] | null;
  maxUses: number | null;
  usedCount: number;
  validTo: string | null;
  validDurationDays: number | null;
  isActive: boolean;
  description: string | null;
  createdAt: string;
};

type PromoCodeRedemption = {
  id: number;
  promoCodeId: number;
  userId: number;
  paymentId: number | null;
  originalAmount: number;
  discountedAmount: number;
  appliedDiscount: number;
  redeemedAt: string;
};

export default function SuperAdminPromoCodesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPromoCodeId, setSelectedPromoCodeId] = useState<number | null>(null);
  const [isRedemptionsOpen, setIsRedemptionsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent" as "percent" | "amount",
    discountPercent: 10,
    discountAmount: 500,
    appliesTo: "all" as "all" | "packages" | "reports",
    maxUses: 100,
    validDurationDays: 30,
    description: "",
  });

  const { data: promoCodes, isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/promo-codes"],
  });

  const { data: redemptions, isLoading: isLoadingRedemptions } = useQuery<PromoCodeRedemption[]>({
    queryKey: ["/api/superadmin/promo-codes", selectedPromoCodeId, "redemptions"],
    enabled: !!selectedPromoCodeId && isRedemptionsOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/promo-codes", {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountPercent: data.discountType === "percent" ? data.discountPercent : null,
        discountAmount: data.discountType === "amount" ? data.discountAmount : null,
        appliesTo: data.appliesTo,
        maxUses: data.maxUses || null,
        validDurationDays: data.validDurationDays || null,
        description: data.description || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsCreateOpen(false);
      setFormData({
        code: "",
        discountType: "percent",
        discountPercent: 10,
        discountAmount: 500,
        appliesTo: "all",
        maxUses: 100,
        validDurationDays: 30,
        description: "",
      });
      toast({
        title: "Промокод создан",
        description: "Новый промокод успешно создан.",
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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/promo-codes/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: "Статус обновлен",
        description: "Статус промокода успешно изменен.",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/superadmin/promo-codes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: "Промокод удален",
        description: "Промокод успешно удален.",
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

  const formatDate = (date: string | null) => {
    if (!date) return "Без ограничения";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discountType === "percent" && promo.discountPercent) {
      return `${promo.discountPercent}%`;
    }
    if (promo.discountType === "amount" && promo.discountAmount) {
      return formatPrice(promo.discountAmount);
    }
    return "-";
  };

  const getAppliesToDisplay = (appliesTo: string) => {
    switch (appliesTo) {
      case "all":
        return "Все";
      case "packages":
        return "Пакеты аудита";
      case "reports":
        return "Отчеты";
      default:
        return appliesTo;
    }
  };

  const handleViewRedemptions = (promoCodeId: number) => {
    setSelectedPromoCodeId(promoCodeId);
    setIsRedemptionsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Управление промокодами</h1>
          <p className="text-muted-foreground mt-1">
            Создание и управление промокодами для скидок
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-promo">
              <Plus className="mr-2 h-4 w-4" />
              Создать промокод
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Новый промокод</DialogTitle>
              <DialogDescription>
                Создайте промокод для предоставления скидок пользователям
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Код промокода</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SALE2024"
                  data-testid="input-promo-code"
                />
              </div>

              <div className="space-y-2">
                <Label>Тип скидки</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "percent" | "amount") =>
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Процент</SelectItem>
                    <SelectItem value="amount">Фиксированная сумма</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.discountType === "percent" ? (
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Размер скидки (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })
                    }
                    data-testid="input-discount-percent"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Размер скидки (руб.)</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min="1"
                    value={formData.discountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, discountAmount: parseInt(e.target.value) || 0 })
                    }
                    data-testid="input-discount-amount"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Применяется к</Label>
                <Select
                  value={formData.appliesTo}
                  onValueChange={(value: "all" | "packages" | "reports") =>
                    setFormData({ ...formData, appliesTo: value })
                  }
                >
                  <SelectTrigger data-testid="select-applies-to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="packages">Только пакеты аудита</SelectItem>
                    <SelectItem value="reports">Только отчеты</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Макс. использований</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })
                    }
                    data-testid="input-max-uses"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validDays">Срок действия (дней)</Label>
                  <Input
                    id="validDays"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.validDurationDays}
                    onChange={(e) =>
                      setFormData({ ...formData, validDurationDays: parseInt(e.target.value) || 0 })
                    }
                    data-testid="input-valid-days"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание (опционально)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Акция на Новый год"
                  data-testid="input-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.code || createMutation.isPending}
                data-testid="button-submit-promo"
              >
                {createMutation.isPending ? "Создание..." : "Создать"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего промокодов</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных</CardTitle>
            <Percent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes?.filter((p) => p.isActive).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Использований</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes?.reduce((sum, p) => sum + p.usedCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Истекших</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes?.filter((p) => p.validTo && new Date(p.validTo) < new Date()).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список промокодов</CardTitle>
          <CardDescription>Управление всеми промокодами системы</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : promoCodes && promoCodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код</TableHead>
                  <TableHead>Скидка</TableHead>
                  <TableHead>Применяется к</TableHead>
                  <TableHead>Использований</TableHead>
                  <TableHead>Действует до</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {promo.discountType === "percent" ? (
                          <Percent className="h-3 w-3" />
                        ) : (
                          <Banknote className="h-3 w-3" />
                        )}
                        {getDiscountDisplay(promo)}
                      </div>
                    </TableCell>
                    <TableCell>{getAppliesToDisplay(promo.appliesTo)}</TableCell>
                    <TableCell>
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                    </TableCell>
                    <TableCell>{formatDate(promo.validTo)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={promo.isActive}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: promo.id, isActive: checked })
                        }
                        data-testid={`switch-active-${promo.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewRedemptions(promo.id)}
                          data-testid={`button-view-redemptions-${promo.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-${promo.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить промокод?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить промокод {promo.code}? Это действие
                                нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(promo.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Промокодов пока нет</p>
              <p className="text-sm">Создайте первый промокод для предоставления скидок</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRedemptionsOpen} onOpenChange={setIsRedemptionsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>История использований</DialogTitle>
            <DialogDescription>
              Список пользователей, использовавших этот промокод
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingRedemptions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : redemptions && redemptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID пользователя</TableHead>
                    <TableHead>Сумма до</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Итого</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>#{r.userId}</TableCell>
                      <TableCell>{formatPrice(r.originalAmount)}</TableCell>
                      <TableCell className="text-green-600">
                        -{formatPrice(r.appliedDiscount)}
                      </TableCell>
                      <TableCell>{formatPrice(r.discountedAmount)}</TableCell>
                      <TableCell>
                        {new Date(r.redeemedAt).toLocaleDateString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Этот промокод еще не использовался</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
