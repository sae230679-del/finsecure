import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatDuration } from "@/lib/packages-data";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AuditPackage } from "@shared/schema";
import {
  Package,
  Edit,
  Save,
  Loader2,
  ListChecks,
  Clock,
  Plus,
  Trash2,
  Settings,
  FileText,
} from "lucide-react";

interface CriteriaTemplate {
  name: string;
  description: string;
  category: string;
}

interface EditForm {
  price: number;
  description: string;
  criteriaCount: number;
  durationMin: number;
  durationMax: number;
  criteriaTemplates: CriteriaTemplate[];
}

const CRITERIA_CATEGORIES = [
  { value: "fz152", label: "ФЗ-152" },
  { value: "fz149", label: "ФЗ-149" },
  { value: "cookies", label: "Cookie" },
  { value: "technical", label: "Технические" },
  { value: "legal", label: "Юридические" },
  { value: "content", label: "Контент" },
  { value: "security", label: "Безопасность" },
];

export default function AdminPackagesPage() {
  const { toast } = useToast();
  const [editingPackage, setEditingPackage] = useState<AuditPackage | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    price: 0,
    description: "",
    criteriaCount: 0,
    durationMin: 0,
    durationMax: 0,
    criteriaTemplates: [],
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCriteria, setNewCriteria] = useState<CriteriaTemplate>({
    name: "",
    description: "",
    category: "fz152",
  });

  const { data: packages, isLoading } = useQuery<AuditPackage[]>({
    queryKey: ["/api/packages"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number } & Partial<EditForm>) => {
      const response = await apiRequest("PATCH", `/api/admin/packages/${data.id}`, {
        price: data.price,
        description: data.description,
        criteriaCount: data.criteriaCount,
        durationMin: data.durationMin,
        durationMax: data.durationMax,
        criteriaTemplates: data.criteriaTemplates,
      });
      return response.json();
    },
    onSuccess: (updatedPkg: AuditPackage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Пакет обновлен",
        description: "Изменения успешно сохранены.",
      });
      const templates = (updatedPkg.criteriaTemplates as CriteriaTemplate[] | null) || [];
      setEditForm({
        price: updatedPkg.price,
        description: updatedPkg.description || "",
        criteriaCount: updatedPkg.criteriaCount,
        durationMin: updatedPkg.durationMin,
        durationMax: updatedPkg.durationMax,
        criteriaTemplates: templates,
      });
      setDialogOpen(false);
      setEditingPackage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (pkg: AuditPackage) => {
    const latestPkg = packages?.find(p => p.id === pkg.id) || pkg;
    setEditingPackage(latestPkg);
    const templates = (latestPkg.criteriaTemplates as CriteriaTemplate[] | null) || [];
    setEditForm({
      price: latestPkg.price,
      description: latestPkg.description || "",
      criteriaCount: latestPkg.criteriaCount,
      durationMin: latestPkg.durationMin,
      durationMax: latestPkg.durationMax,
      criteriaTemplates: templates,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingPackage) return;
    updateMutation.mutate({
      id: editingPackage.id,
      ...editForm,
      criteriaCount: editForm.criteriaTemplates.length || editForm.criteriaCount,
    });
  };

  const addCriteria = () => {
    if (!newCriteria.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название критерия обязательно",
        variant: "destructive",
      });
      return;
    }
    if (!newCriteria.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Описание критерия обязательно",
        variant: "destructive",
      });
      return;
    }
    setEditForm({
      ...editForm,
      criteriaTemplates: [...editForm.criteriaTemplates, { 
        name: newCriteria.name.trim(),
        description: newCriteria.description.trim(),
        category: newCriteria.category,
      }],
    });
    setNewCriteria({ name: "", description: "", category: "fz152" });
  };

  const removeCriteria = (index: number) => {
    setEditForm({
      ...editForm,
      criteriaTemplates: editForm.criteriaTemplates.filter((_, i) => i !== index),
    });
  };

  const getCategoryLabel = (category: string) => {
    return CRITERIA_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const groupedCriteria = editForm.criteriaTemplates.reduce((acc, criteria, index) => {
    const cat = criteria.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...criteria, index });
    return acc;
  }, {} as Record<string, (CriteriaTemplate & { index: number })[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Управление пакетами</h1>
        <p className="text-muted-foreground mt-1">
          Настройка цен, критериев и описаний для пакетов аудита
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Пакеты аудита</CardTitle>
          <CardDescription>
            Вы можете изменять цены, критерии проверки и описания пакетов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : packages && packages.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card key={pkg.id} data-testid={`card-package-${pkg.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg" data-testid={`text-package-name-${pkg.id}`}>
                        {pkg.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(pkg)}
                        data-testid={`button-edit-package-${pkg.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold" data-testid={`text-package-price-${pkg.id}`}>
                      {formatPrice(pkg.price)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ListChecks className="h-4 w-4" />
                        <span data-testid={`text-criteria-count-${pkg.id}`}>{pkg.criteriaCount} критериев</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(pkg.durationMin, pkg.durationMax)}</span>
                      </div>
                    </div>
                    {(pkg.criteriaTemplates as CriteriaTemplate[] | null)?.length ? (
                      <Badge variant="secondary" className="text-xs">
                        Критерии настроены
                      </Badge>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет пакетов</h3>
              <p className="text-muted-foreground">
                Пакеты аудита будут отображаться здесь
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              Редактирование: {editingPackage?.name}
            </DialogTitle>
            <DialogDescription>
              Настройте параметры пакета и критерии проверки
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general" data-testid="tab-general">
                <Settings className="h-4 w-4 mr-2" />
                Основные
              </TabsTrigger>
              <TabsTrigger value="criteria" data-testid="tab-criteria">
                <FileText className="h-4 w-4 mr-2" />
                Критерии ({editForm.criteriaTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена (в рублях)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    data-testid="input-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Количество критериев</Label>
                  <Input
                    type="number"
                    value={editForm.criteriaTemplates.length || editForm.criteriaCount}
                    disabled
                    data-testid="input-criteria-count"
                  />
                  <p className="text-xs text-muted-foreground">
                    Рассчитывается автоматически
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationMin">Мин. время (мин)</Label>
                  <Input
                    id="durationMin"
                    type="number"
                    value={editForm.durationMin}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        durationMin: parseInt(e.target.value) || 0,
                      })
                    }
                    data-testid="input-duration-min"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMax">Макс. время (мин)</Label>
                  <Input
                    id="durationMax"
                    type="number"
                    value={editForm.durationMax}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        durationMax: parseInt(e.target.value) || 0,
                      })
                    }
                    data-testid="input-duration-max"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  data-testid="input-description"
                />
              </div>
            </TabsContent>

            <TabsContent value="criteria" className="flex-1 overflow-hidden flex flex-col space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Добавить критерий</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Категория</Label>
                      <Select
                        value={newCriteria.category}
                        onValueChange={(value) =>
                          setNewCriteria({ ...newCriteria, category: value })
                        }
                      >
                        <SelectTrigger data-testid="select-new-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITERIA_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Название</Label>
                      <Input
                        placeholder="Название критерия"
                        value={newCriteria.name}
                        onChange={(e) =>
                          setNewCriteria({ ...newCriteria, name: e.target.value })
                        }
                        data-testid="input-new-criteria-name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Описание</Label>
                      <Input
                        placeholder="Краткое описание"
                        value={newCriteria.description}
                        onChange={(e) =>
                          setNewCriteria({ ...newCriteria, description: e.target.value })
                        }
                        data-testid="input-new-criteria-description"
                      />
                    </div>
                  </div>
                  <Button onClick={addCriteria} size="sm" data-testid="button-add-criteria">
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </CardContent>
              </Card>

              <ScrollArea className="flex-1 border rounded-md">
                <div className="p-4 space-y-4">
                  {Object.keys(groupedCriteria).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Критерии не добавлены</p>
                      <p className="text-sm">Добавьте критерии выше</p>
                    </div>
                  ) : (
                    Object.entries(groupedCriteria).map(([category, criteria]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                          {getCategoryLabel(category)} ({criteria.length})
                        </h4>
                        <div className="space-y-2">
                          {criteria.map((c) => (
                            <div
                              key={c.index}
                              className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                              data-testid={`criteria-item-${c.index}`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{c.name}</p>
                                {c.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {c.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => removeCriteria(c.index)}
                                data-testid={`button-remove-criteria-${c.index}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-testid="button-cancel"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              data-testid="button-save-package"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
