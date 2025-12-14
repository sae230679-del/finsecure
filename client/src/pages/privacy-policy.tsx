import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="link-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            На главную
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-page-title">
              Политика конфиденциальности
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              Дата последнего обновления: 14 декабря 2024 г.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
              <p className="text-muted-foreground leading-relaxed">
                Настоящая Политика конфиденциальности персональных данных (далее — Политика) 
                действует в отношении всей информации, которую сервис SecureLex.ru может получить 
                о пользователе во время использования сайта, программ и продуктов.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Оператор персональных данных</h2>
              <p className="text-muted-foreground leading-relaxed">
                Оператором персональных данных является владелец сервиса SecureLex.ru. 
                Контактная информация для связи по вопросам обработки персональных данных 
                указана в разделе контактов на сайте.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Цели обработки персональных данных</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Мы обрабатываем персональные данные для следующих целей:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Идентификация пользователя, зарегистрированного на сайте</li>
                <li>Предоставление доступа к персонализированным сервисам</li>
                <li>Обработка заказов и предоставление услуг аудита</li>
                <li>Связь с пользователем для уточнения информации по заказу</li>
                <li>Отправка уведомлений о статусе аудита и платежей</li>
                <li>Улучшение качества сервиса и разработка новых функций</li>
                <li>Проведение маркетинговых акций (с согласия пользователя)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Состав персональных данных</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Мы собираем и обрабатываем следующие персональные данные:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Имя (ФИО)</li>
                <li>Адрес электронной почты</li>
                <li>Номер телефона</li>
                <li>Название организации (при наличии)</li>
                <li>ИНН организации (при наличии)</li>
                <li>IP-адрес</li>
                <li>Данные cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Правовые основания обработки</h2>
              <p className="text-muted-foreground leading-relaxed">
                Обработка персональных данных осуществляется на основании:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Федерального закона от 27.07.2006 N 152-ФЗ "О персональных данных"</li>
                <li>Согласия субъекта персональных данных на обработку</li>
                <li>Договора, стороной которого является субъект персональных данных</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Срок хранения персональных данных</h2>
              <p className="text-muted-foreground leading-relaxed">
                Персональные данные хранятся в течение срока действия договора и 3 лет 
                после его окончания, если иное не предусмотрено законодательством РФ. 
                По истечении срока хранения персональные данные уничтожаются.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Права субъекта персональных данных</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Вы имеете право:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Получить информацию об обработке ваших персональных данных</li>
                <li>Требовать уточнения, блокирования или уничтожения данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Обжаловать действия оператора в Роскомнадзор или в суд</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Меры защиты персональных данных</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы применяем необходимые правовые, организационные и технические меры 
                для защиты персональных данных от неправомерного доступа, уничтожения, 
                изменения, блокирования, копирования и распространения.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Контактная информация</h2>
              <p className="text-muted-foreground leading-relaxed">
                По всем вопросам, связанным с обработкой персональных данных, 
                вы можете обратиться по адресу электронной почты, указанному в 
                разделе контактов на сайте.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
