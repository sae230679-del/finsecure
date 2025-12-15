import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { X, Cookie, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "securelex_cookie_consent";
const COOKIE_CONSENT_VERSION = "1.0";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  acceptedAt: string;
};

function safeLocalStorage() {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    version: COOKIE_CONSENT_VERSION,
    acceptedAt: "",
  });

  useEffect(() => {
    const storage = safeLocalStorage();
    if (!storage) {
      setShowBanner(true);
      return;
    }
    
    try {
      const saved = storage.getItem(COOKIE_CONSENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CookiePreferences;
        if (parsed.version === COOKIE_CONSENT_VERSION) {
          setPreferences(parsed);
          return;
        }
      }
      setShowBanner(true);
    } catch {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const storage = safeLocalStorage();
    if (storage) {
      try {
        storage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
      } catch {
        // Silent fail for private browsing
      }
    }
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      version: COOKIE_CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      version: COOKIE_CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    });
  };

  const saveCustomPreferences = () => {
    savePreferences({
      ...preferences,
      version: COOKIE_CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
    });
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Мы используем файлы cookie</p>
                  <p className="text-muted-foreground">
                    Для улучшения работы сайта и анализа трафика. Продолжая использовать сайт, 
                    вы соглашаетесь с{" "}
                    <Link href="/privacy" className="underline hover:text-primary">
                      политикой конфиденциальности
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSettings(true)}
                  data-testid="button-cookie-settings"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Настроить
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={acceptNecessary}
                  data-testid="button-cookie-necessary"
                >
                  Только необходимые
                </Button>
                <Button 
                  size="sm" 
                  onClick={acceptAll}
                  data-testid="button-cookie-accept"
                >
                  Принять все
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки cookie</DialogTitle>
            <DialogDescription>
              Выберите, какие типы cookie вы разрешаете использовать
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Необходимые</Label>
                <p className="text-sm text-muted-foreground">
                  Обязательны для работы сайта
                </p>
              </div>
              <Switch checked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Аналитика</Label>
                <p className="text-sm text-muted-foreground">
                  Яндекс.Метрика для анализа посещаемости
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, analytics: checked })
                }
                data-testid="switch-cookie-analytics"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Маркетинг</Label>
                <p className="text-sm text-muted-foreground">
                  Рекламные и маркетинговые cookie
                </p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, marketing: checked })
                }
                data-testid="switch-cookie-marketing"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Отмена
            </Button>
            <Button onClick={saveCustomPreferences} data-testid="button-cookie-save">
              Сохранить настройки
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
