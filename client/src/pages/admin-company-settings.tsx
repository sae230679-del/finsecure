import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, Building2, Phone, MessageCircle, Loader2 } from "lucide-react";
import { SiTelegram, SiWhatsapp, SiVk } from "react-icons/si";

type SystemSetting = {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
};

type CompanyRequisites = {
  legalType: "self_employed" | "ip" | "ooo";
  companyName: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  ogrnip?: string;
  bankAccount: string;
  bankName: string;
  bik: string;
  corrAccount: string;
  bankInn?: string;
  bankKpp?: string;
  legalAddress: string;
};

type ContactSettings = {
  email: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  vk: string;
  maxMessenger: string;
};

const defaultRequisites: CompanyRequisites = {
  legalType: "ooo",
  companyName: 'ООО "РЕЭР-А"',
  inn: "9729411485",
  kpp: "772901001",
  ogrn: "1257700514796",
  bankAccount: "40702810640070005900",
  bankName: "ПАО Сбербанк",
  bik: "044525225",
  corrAccount: "30101810400000000225",
  bankInn: "7707083893",
  bankKpp: "773643002",
  legalAddress: "119620, Г.МОСКВА, ВН.ТЕР.Г. МУНИЦИПАЛЬНЫЙ ОКРУГ СОЛНЦЕВО, ПР-КТ СОЛНЦЕВСКИЙ, Д. 14, ПОМЕЩ. 4/1",
};

const defaultContacts: ContactSettings = {
  email: "support@securelex.ru",
  phone: "+7 (800) 555-35-35",
  telegram: "",
  whatsapp: "",
  vk: "",
  maxMessenger: "",
};

export default function AdminCompanySettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/superadmin/settings"],
  });

  const [requisites, setRequisites] = useState<CompanyRequisites>(defaultRequisites);
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);

  useEffect(() => {
    if (settings) {
      const requisitesSetting = settings.find(s => s.key === "company_requisites");
      const contactsSetting = settings.find(s => s.key === "contact_settings");
      
      if (requisitesSetting) {
        try {
          setRequisites({ ...defaultRequisites, ...JSON.parse(requisitesSetting.value) });
        } catch (e) {
          console.error("Failed to parse requisites:", e);
        }
      }
      
      if (contactsSetting) {
        try {
          setContacts({ ...defaultContacts, ...JSON.parse(contactsSetting.value) });
        } catch (e) {
          console.error("Failed to parse contacts:", e);
        }
      }
    }
  }, [settings]);

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/superadmin/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      toast({
        title: "Сохранено",
        description: "Настройки успешно сохранены.",
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

  const handleSaveRequisites = () => {
    saveSettingMutation.mutate({
      key: "company_requisites",
      value: JSON.stringify(requisites),
    });
  };

  const handleSaveContacts = () => {
    saveSettingMutation.mutate({
      key: "contact_settings",
      value: JSON.stringify(contacts),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Реквизиты и контакты</h1>
        <p className="text-muted-foreground mt-1">
          Настройка реквизитов компании и контактной информации для футера сайта
        </p>
      </div>

      <Tabs defaultValue="requisites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requisites" data-testid="tab-requisites">
            <Building2 className="h-4 w-4 mr-2" />
            Реквизиты
          </TabsTrigger>
          <TabsTrigger value="contacts" data-testid="tab-contacts">
            <Phone className="h-4 w-4 mr-2" />
            Контакты
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requisites" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Юридический статус</CardTitle>
              <CardDescription>
                Выберите форму собственности и заполните реквизиты
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Форма собственности</Label>
                <Select
                  value={requisites.legalType}
                  onValueChange={(value: "self_employed" | "ip" | "ooo") => 
                    setRequisites({ ...requisites, legalType: value })
                  }
                >
                  <SelectTrigger data-testid="select-legal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_employed">Самозанятый</SelectItem>
                    <SelectItem value="ip">ИП (Индивидуальный предприниматель)</SelectItem>
                    <SelectItem value="ooo">ООО (Общество с ограниченной ответственностью)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  {requisites.legalType === "self_employed" ? "ФИО" : 
                   requisites.legalType === "ip" ? "Название ИП" : "Название организации"}
                </Label>
                <Input
                  id="companyName"
                  value={requisites.companyName}
                  onChange={(e) => setRequisites({ ...requisites, companyName: e.target.value })}
                  placeholder={requisites.legalType === "ooo" ? 'ООО "Название"' : "ИП Иванов И.И."}
                  data-testid="input-company-name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН</Label>
                  <Input
                    id="inn"
                    value={requisites.inn}
                    onChange={(e) => setRequisites({ ...requisites, inn: e.target.value })}
                    placeholder="1234567890"
                    data-testid="input-inn"
                  />
                </div>

                {requisites.legalType === "ooo" && (
                  <div className="space-y-2">
                    <Label htmlFor="kpp">КПП</Label>
                    <Input
                      id="kpp"
                      value={requisites.kpp || ""}
                      onChange={(e) => setRequisites({ ...requisites, kpp: e.target.value })}
                      placeholder="123456789"
                      data-testid="input-kpp"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogrn">
                  {requisites.legalType === "ip" ? "ОГРНИП" : "ОГРН"}
                </Label>
                <Input
                  id="ogrn"
                  value={requisites.legalType === "ip" ? (requisites.ogrnip || "") : (requisites.ogrn || "")}
                  onChange={(e) => setRequisites({ 
                    ...requisites, 
                    [requisites.legalType === "ip" ? "ogrnip" : "ogrn"]: e.target.value 
                  })}
                  placeholder={requisites.legalType === "ip" ? "123456789012345" : "1234567890123"}
                  data-testid="input-ogrn"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Банковские реквизиты</CardTitle>
              <CardDescription>
                Информация для платежей и выставления счетов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Расчётный счёт</Label>
                <Input
                  id="bankAccount"
                  value={requisites.bankAccount}
                  onChange={(e) => setRequisites({ ...requisites, bankAccount: e.target.value })}
                  placeholder="40702810000000000000"
                  data-testid="input-bank-account"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Банк</Label>
                <Input
                  id="bankName"
                  value={requisites.bankName}
                  onChange={(e) => setRequisites({ ...requisites, bankName: e.target.value })}
                  placeholder="ПАО Сбербанк"
                  data-testid="input-bank-name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bik">БИК банка</Label>
                  <Input
                    id="bik"
                    value={requisites.bik}
                    onChange={(e) => setRequisites({ ...requisites, bik: e.target.value })}
                    placeholder="044525225"
                    data-testid="input-bik"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corrAccount">Корр. счёт</Label>
                  <Input
                    id="corrAccount"
                    value={requisites.corrAccount}
                    onChange={(e) => setRequisites({ ...requisites, corrAccount: e.target.value })}
                    placeholder="30101810400000000225"
                    data-testid="input-corr-account"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankInn">ИНН банка</Label>
                  <Input
                    id="bankInn"
                    value={requisites.bankInn || ""}
                    onChange={(e) => setRequisites({ ...requisites, bankInn: e.target.value })}
                    placeholder="7707083893"
                    data-testid="input-bank-inn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankKpp">КПП банка</Label>
                  <Input
                    id="bankKpp"
                    value={requisites.bankKpp || ""}
                    onChange={(e) => setRequisites({ ...requisites, bankKpp: e.target.value })}
                    placeholder="773643002"
                    data-testid="input-bank-kpp"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Юридический адрес</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legalAddress">Адрес</Label>
                <Textarea
                  id="legalAddress"
                  value={requisites.legalAddress}
                  onChange={(e) => setRequisites({ ...requisites, legalAddress: e.target.value })}
                  placeholder="123456, г. Москва, ул. Примерная, д. 1, оф. 100"
                  rows={3}
                  data-testid="input-legal-address"
                />
              </div>

              <Button
                onClick={handleSaveRequisites}
                disabled={saveSettingMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-save-requisites"
              >
                {saveSettingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить реквизиты
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные контакты</CardTitle>
              <CardDescription>
                Email и телефон для связи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contacts.email}
                  onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
                  placeholder="support@securelex.ru"
                  data-testid="input-contact-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={contacts.phone}
                  onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
                  placeholder="+7 (800) 555-35-35"
                  data-testid="input-contact-phone"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Мессенджеры и соцсети
              </CardTitle>
              <CardDescription>
                Ссылки на профили в мессенджерах (отображаются в футере с иконками)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <SiTelegram className="h-4 w-4 text-[#0088cc]" />
                  Telegram
                </Label>
                <Input
                  id="telegram"
                  value={contacts.telegram}
                  onChange={(e) => setContacts({ ...contacts, telegram: e.target.value })}
                  placeholder="https://t.me/username или @username"
                  data-testid="input-telegram"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <SiWhatsapp className="h-4 w-4 text-[#25D366]" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={contacts.whatsapp}
                  onChange={(e) => setContacts({ ...contacts, whatsapp: e.target.value })}
                  placeholder="https://wa.me/79001234567"
                  data-testid="input-whatsapp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vk" className="flex items-center gap-2">
                  <SiVk className="h-4 w-4 text-[#0077FF]" />
                  ВКонтакте
                </Label>
                <Input
                  id="vk"
                  value={contacts.vk}
                  onChange={(e) => setContacts({ ...contacts, vk: e.target.value })}
                  placeholder="https://vk.com/username"
                  data-testid="input-vk"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMessenger" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#FF6600]" />
                  Max Messenger
                </Label>
                <Input
                  id="maxMessenger"
                  value={contacts.maxMessenger}
                  onChange={(e) => setContacts({ ...contacts, maxMessenger: e.target.value })}
                  placeholder="Ссылка или ID в Max Messenger"
                  data-testid="input-max-messenger"
                />
              </div>

              <Button
                onClick={handleSaveContacts}
                disabled={saveSettingMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-save-contacts"
              >
                {saveSettingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить контакты
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
