import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorModeToggle } from "@/components/color-mode-toggle";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Lock, 
  Globe, 
  Cookie, 
  Server, 
  Scale,
  Building2,
  ShoppingCart,
  Laptop,
  Users,
  Newspaper,
  Store,
  Stethoscope,
  Baby,
  HelpCircle
} from "lucide-react";

const siteTypes = [
  { icon: FileText, name: "Лендинг", description: "Одностраничные промо-сайты" },
  { icon: Building2, name: "Корпоративный сайт", description: "Сайты компаний и организаций" },
  { icon: ShoppingCart, name: "Интернет-магазин", description: "E-commerce платформы" },
  { icon: Laptop, name: "SaaS / Сервис", description: "Онлайн-сервисы и приложения" },
  { icon: Users, name: "Портал / Сообщество", description: "Форумы и социальные платформы" },
  { icon: Store, name: "Маркетплейс", description: "Торговые площадки" },
  { icon: Newspaper, name: "Медиа / Блог", description: "Новостные и контентные сайты" },
  { icon: Stethoscope, name: "Медицинские услуги", description: "Клиники и медицинские сервисы" },
  { icon: Baby, name: "Детские услуги", description: "Сайты для детей и родителей" },
  { icon: HelpCircle, name: "Другое", description: "Универсальная проверка" },
];

const criteriaCategories = [
  {
    icon: Shield,
    title: "ФЗ-152 (Персональные данные)",
    count: 12,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    criteria: [
      "Наличие политики обработки персональных данных",
      "Согласие на обработку ПД в формах",
      "Указание оператора персональных данных",
      "Цели сбора персональных данных",
      "Сроки хранения персональных данных",
      "Права субъектов персональных данных",
      "Порядок отзыва согласия",
      "Трансграничная передача данных",
      "Уведомление Роскомнадзора",
      "Ответственный за обработку ПД",
      "Меры по защите персональных данных",
      "Актуальность политики конфиденциальности",
    ],
  },
  {
    icon: Globe,
    title: "ФЗ-149 (Информация)",
    count: 4,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    criteria: [
      "Информация о владельце сайта",
      "Контактные данные организации",
      "Юридический адрес компании",
      "Реквизиты организации (ИНН, ОГРН)",
    ],
  },
  {
    icon: Cookie,
    title: "Cookie и отслеживание",
    count: 9,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    criteria: [
      "Наличие cookie-баннера",
      "Возможность отклонить cookies",
      "Гранулярное управление cookies",
      "Политика использования cookies",
      "Классификация типов cookies",
      "Сроки хранения cookies",
      "Сторонние cookies и трекеры",
      "Аналитические системы",
      "Рекламные пиксели",
    ],
  },
  {
    icon: Server,
    title: "Техническая безопасность",
    count: 12,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    criteria: [
      "SSL/TLS сертификат",
      "HTTPS редирект",
      "Актуальность сертификата",
      "Безопасные заголовки HTTP",
      "Content Security Policy",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Защита от XSS",
      "Защита форм от CSRF",
      "Безопасность API",
      "Шифрование данных",
      "Резервное копирование",
    ],
  },
  {
    icon: Scale,
    title: "Юридические страницы",
    count: 8,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    criteria: [
      "Пользовательское соглашение",
      "Условия использования",
      "Политика конфиденциальности",
      "Политика возврата",
      "Условия доставки",
      "Публичная оферта",
      "Отказ от ответственности",
      "Авторские права и лицензии",
    ],
  },
];

export default function CriteriaPage() {
  const { isAuthenticated, user } = useAuth();
  const totalCriteria = criteriaCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SecureLex.ru</span>
            </Link>
            <div className="flex items-center gap-4">
              <ColorModeToggle />
              {isAuthenticated ? (
                <Button asChild data-testid="link-dashboard">
                  <Link href="/dashboard">Личный кабинет</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild data-testid="link-login">
                    <Link href="/auth">Войти</Link>
                  </Button>
                  <Button asChild data-testid="link-register">
                    <Link href="/auth">Начать</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {totalCriteria}+ критериев проверки
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Критерии проверки сайтов
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Наша система анализирует более {totalCriteria} критериев для комплексной проверки 
              соответствия вашего сайта российскому и международному законодательству
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Типы сайтов</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {siteTypes.map((type, index) => (
                <Card key={index} className="hover-elevate text-center">
                  <CardContent className="pt-6 pb-4">
                    <type.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-sm mb-1">{type.name}</h3>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Категории критериев</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {criteriaCategories.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${category.bgColor}`}>
                        <category.icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.count} проверок</CardDescription>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.criteria.map((criterion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${category.color}`} />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center py-12 border-t">
            <h2 className="text-2xl font-bold mb-4">Готовы проверить свой сайт?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Получите бесплатный экспресс-отчет с оценкой соответствия или закажите 
              полный детальный анализ за 900 рублей
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-check-site">
                <a href="/#check">
                  Проверить сайт
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
