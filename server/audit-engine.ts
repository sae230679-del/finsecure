import OpenAI from "openai";
import https from "https";
import http from "http";
import { URL } from "url";

const OPENAI_MODEL = "gpt-4o-mini";
const isProduction = process.env.NODE_ENV === "production";
const MAX_BYTES = 2 * 1024 * 1024; // 2MB response limit

// SSRF protection - block private/local IPs
const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
];

function isPrivateIp(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  const ipv4Match = lower.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (!ipv4Match) return false;
  return PRIVATE_IP_RANGES.some((re) => re.test(lower));
}

let cachedGigaChatToken: { token: string; expiresAt: number } | null = null;

async function getGigaChatAccessToken(): Promise<string | null> {
  const apiKey = process.env.GIGACHAT_API_KEY;
  if (!apiKey) return null;

  if (cachedGigaChatToken && cachedGigaChatToken.expiresAt > Date.now()) {
    return cachedGigaChatToken.token;
  }

  return new Promise((resolve) => {
    const data = "scope=GIGACHAT_API_PERS";
    
    const options = {
      hostname: "ngw.devices.sberbank.ru",
      port: 443,
      path: "/api/v2/oauth",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "RqUID": crypto.randomUUID(),
        "Authorization": `Basic ${apiKey}`,
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          if (result.access_token) {
            cachedGigaChatToken = {
              token: result.access_token,
              expiresAt: Date.now() + (result.expires_at ? result.expires_at * 1000 - Date.now() - 60000 : 1800000),
            };
            resolve(result.access_token);
          } else {
            console.error("GigaChat auth failed:", body);
            resolve(null);
          }
        } catch (e) {
          console.error("GigaChat auth parse error:", e);
          resolve(null);
        }
      });
    });

    req.on("error", (e) => {
      console.error("GigaChat auth error:", e);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
}

async function callGigaChat(systemPrompt: string, userPrompt: string): Promise<any> {
  const token = await getGigaChatAccessToken();
  if (!token) return null;

  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      model: "GigaChat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const options = {
      hostname: "gigachat.devices.sberbank.ru",
      port: 443,
      path: "/api/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          if (result.choices && result.choices[0]) {
            const content = result.choices[0].message?.content || "";
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              resolve(JSON.parse(jsonMatch[0]));
            } else {
              resolve({ summary: content, recommendations: [], additional_issues: [] });
            }
          } else {
            console.error("GigaChat response error:", body);
            resolve(null);
          }
        } catch (e) {
          console.error("GigaChat parse error:", e);
          resolve(null);
        }
      });
    });

    req.on("error", (e) => {
      console.error("GigaChat request error:", e);
      resolve(null);
    });

    req.write(requestBody);
    req.end();
  });
}

export interface AuditCheckResult {
  id: string;
  name: string;
  category: string;
  status: "passed" | "warning" | "failed";
  description: string;
  details?: string;
  evidence?: string;
}

export interface WebsiteData {
  url: string;
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  sslInfo?: {
    valid: boolean;
    issuer?: string;
    expiresAt?: string;
    protocol?: string;
  };
  responseTime: number;
  error?: string;
}

export interface AuditReport {
  url: string;
  checks: AuditCheckResult[];
  scorePercent: number;
  severity: "low" | "medium" | "high";
  passedCount: number;
  warningCount: number;
  failedCount: number;
  totalCount: number;
  summary: string;
  recommendations: string[];
  processedAt: Date;
}

export type AuditAiMode = "gigachat_only" | "openai_only" | "hybrid" | "none";

export interface AuditOptions {
  level2?: boolean;
  aiMode?: AuditAiMode;
  onProgress?: (stage: number, checks: AuditCheckResult[]) => void;
}

async function fetchWebsite(urlString: string, timeout = 15000): Promise<WebsiteData> {
  const startTime = Date.now();
  
  // Parse and validate URL first
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return {
      url: urlString,
      html: "",
      statusCode: 0,
      headers: {},
      responseTime: Date.now() - startTime,
      error: "Некорректный URL",
    };
  }

  // SSRF protection: block localhost and private IPs
  if (parsed.hostname === "localhost" || isPrivateIp(parsed.hostname)) {
    return {
      url: urlString,
      html: "",
      statusCode: 0,
      headers: {},
      responseTime: Date.now() - startTime,
      error: "Запрещён доступ к локальным/внутренним адресам",
    };
  }
  
  return new Promise((resolve) => {
    try {
      const isHttps = parsed.protocol === "https:";
      const lib = isHttps ? https : http;
      
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "GET",
        timeout,
        headers: {
          "User-Agent": "SecureLex-Audit-Bot/1.0 (Website Compliance Checker)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
        rejectUnauthorized: isProduction,
      };

      const req = lib.request(options, (res) => {
        let html = "";
        let received = 0;
        const headers: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(res.headers)) {
          if (typeof value === "string") {
            headers[key.toLowerCase()] = value;
          } else if (Array.isArray(value)) {
            headers[key.toLowerCase()] = value.join(", ");
          }
        }

        res.on("data", (chunk) => {
          received += Buffer.byteLength(chunk);
          if (received > MAX_BYTES) {
            res.destroy();
            return;
          }
          html += chunk.toString("utf8");
        });

        res.on("end", () => {
          const responseTime = Date.now() - startTime;
          
          let sslInfo: WebsiteData["sslInfo"] = undefined;
          if (isHttps && res.socket && (res.socket as any).getPeerCertificate) {
            try {
              const cert = (res.socket as any).getPeerCertificate();
              if (cert && cert.valid_to) {
                sslInfo = {
                  valid: true,
                  issuer: cert.issuer?.O || cert.issuer?.CN,
                  expiresAt: cert.valid_to,
                  protocol: (res.socket as any).getProtocol?.() || "TLS",
                };
              }
            } catch (e) {
              sslInfo = { valid: false };
            }
          } else if (isHttps) {
            sslInfo = { valid: true, protocol: "TLS" };
          }

          resolve({
            url: urlString,
            html,
            statusCode: res.statusCode || 0,
            headers,
            sslInfo,
            responseTime,
          });
        });
      });

      req.setTimeout(timeout, () => {
        req.destroy(new Error("Request timed out"));
      });

      req.on("error", (error) => {
        resolve({
          url: urlString,
          html: "",
          statusCode: 0,
          headers: {},
          responseTime: Date.now() - startTime,
          error: error.message,
        });
      });

      req.end();
    } catch (error: any) {
      resolve({
        url: urlString,
        html: "",
        statusCode: 0,
        headers: {},
        responseTime: Date.now() - startTime,
        error: error.message,
      });
    }
  });
}

function checkHttps(data: WebsiteData): AuditCheckResult {
  const isHttps = data.url.startsWith("https://");
  return {
    id: "SEC-001",
    name: "HTTPS/SSL сертификат",
    category: "security",
    status: isHttps && data.statusCode > 0 ? "passed" : "failed",
    description: "Проверка безопасного HTTPS соединения",
    details: isHttps 
      ? `Сайт использует HTTPS${data.sslInfo?.protocol ? ` (${data.sslInfo.protocol})` : ""}`
      : "Сайт не использует HTTPS - данные передаются без шифрования",
    evidence: data.sslInfo?.expiresAt ? `Сертификат действителен до ${data.sslInfo.expiresAt}` : undefined,
  };
}

function checkSecurityHeaders(data: WebsiteData): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  
  const hstsHeader = data.headers["strict-transport-security"];
  results.push({
    id: "SEC-002",
    name: "HSTS Header",
    category: "security",
    status: hstsHeader ? "passed" : "warning",
    description: "HTTP Strict Transport Security",
    details: hstsHeader 
      ? `HSTS настроен: ${hstsHeader.substring(0, 100)}`
      : "HSTS не настроен - браузер может использовать небезопасное HTTP соединение",
  });

  const cspHeader = data.headers["content-security-policy"];
  results.push({
    id: "SEC-003",
    name: "Content Security Policy",
    category: "security",
    status: cspHeader ? "passed" : "warning",
    description: "Политика безопасности контента",
    details: cspHeader 
      ? "CSP настроен для защиты от XSS и инъекций"
      : "CSP не настроен - сайт уязвим для XSS атак",
  });

  const xFrameOptions = data.headers["x-frame-options"];
  results.push({
    id: "SEC-004",
    name: "X-Frame-Options",
    category: "security",
    status: xFrameOptions ? "passed" : "warning",
    description: "Защита от clickjacking",
    details: xFrameOptions 
      ? `Защита от встраивания: ${xFrameOptions}`
      : "Защита от clickjacking не настроена",
  });

  const xContentType = data.headers["x-content-type-options"];
  results.push({
    id: "SEC-005",
    name: "X-Content-Type-Options",
    category: "security",
    status: xContentType === "nosniff" ? "passed" : "warning",
    description: "Защита от MIME sniffing",
    details: xContentType 
      ? "Защита от MIME sniffing активна"
      : "Защита от MIME sniffing не настроена",
  });

  return results;
}

function checkPrivacyPolicy(html: string): AuditCheckResult {
  const lowerHtml = html.toLowerCase();
  
  const policyPatterns = [
    /политик[аи|уыей]\s*конфиденциальности/i,
    /privacy\s*policy/i,
    /обработк[аиуеой]\s*персональных\s*данных/i,
    /защит[аиуеой]\s*персональных\s*данных/i,
    /href\s*=\s*["'][^"']*privacy[^"']*["']/i,
    /href\s*=\s*["'][^"']*policy[^"']*["']/i,
    /href\s*=\s*["'][^"']*конфиденциальност[^"']*["']/i,
  ];

  const hasPolicy = policyPatterns.some(pattern => pattern.test(html));
  
  return {
    id: "PDN-001",
    name: "Политика конфиденциальности",
    category: "fz152",
    status: hasPolicy ? "passed" : "failed",
    description: "Наличие и доступность политики конфиденциальности (ФЗ-152)",
    details: hasPolicy 
      ? "Ссылка на политику конфиденциальности найдена"
      : "Политика конфиденциальности не найдена на странице",
  };
}

function checkConsentCheckbox(html: string): AuditCheckResult {
  const consentPatterns = [
    /согласи[еяюо]\s*(на\s*)?(обработку|передачу)/i,
    /даю\s*согласие/i,
    /принимаю\s*(условия|политику)/i,
    /consent/i,
    /type\s*=\s*["']checkbox["'][^>]*согласи/i,
    /согласи[^"']*type\s*=\s*["']checkbox["']/i,
    /персональных?\s*данных?/i,
  ];

  const formPatterns = [
    /<form[^>]*>/i,
    /<input[^>]*type\s*=\s*["'](text|email|tel|phone)["']/i,
  ];

  const hasForm = formPatterns.some(p => p.test(html));
  const hasConsent = consentPatterns.some(p => p.test(html));

  if (!hasForm) {
    return {
      id: "PDN-002",
      name: "Согласие на обработку ПДн",
      category: "fz152",
      status: "passed",
      description: "Проверка наличия чекбокса согласия в формах (ФЗ-152 ст.9)",
      details: "Формы сбора данных не обнаружены на странице",
    };
  }

  return {
    id: "PDN-002",
    name: "Согласие на обработку ПДн",
    category: "fz152",
    status: hasConsent ? "passed" : "failed",
    description: "Проверка наличия чекбокса согласия в формах (ФЗ-152 ст.9)",
    details: hasConsent 
      ? "Механизм получения согласия на обработку ПДн найден"
      : "В формах отсутствует явное согласие на обработку персональных данных",
  };
}

function checkCookieBanner(html: string): AuditCheckResult {
  const cookiePatterns = [
    /cookie/i,
    /куки/i,
    /файл[аов]*\s*cookie/i,
    /cookie\s*banner/i,
    /cookie\s*consent/i,
    /accept\s*cookie/i,
    /принять\s*cookie/i,
    /использу[ео][тм]\s*cookie/i,
    /мы\s*используем\s*cookie/i,
  ];

  const hasCookieBanner = cookiePatterns.some(p => p.test(html));

  return {
    id: "COOK-001",
    name: "Cookie-баннер",
    category: "cookies",
    status: hasCookieBanner ? "passed" : "warning",
    description: "Уведомление об использовании cookies",
    details: hasCookieBanner 
      ? "Cookie-баннер обнаружен"
      : "Cookie-баннер не обнаружен - возможно нарушение требований ФЗ-152",
  };
}

function checkContactInfo(html: string): AuditCheckResult {
  const contactPatterns = [
    /\+7\s*\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/,
    /8\s*\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    /телефон/i,
    /email/i,
    /контакт/i,
    /связаться/i,
  ];

  const hasContacts = contactPatterns.some(p => p.test(html));

  return {
    id: "INF-001",
    name: "Контактная информация",
    category: "fz149",
    status: hasContacts ? "passed" : "warning",
    description: "Наличие контактных данных оператора (ФЗ-149)",
    details: hasContacts 
      ? "Контактная информация найдена"
      : "Контактная информация не найдена на странице",
  };
}

function checkCompanyRequisites(html: string): AuditCheckResult {
  const requisitePatterns = [
    /инн\s*:?\s*\d{10,12}/i,
    /огрн\s*:?\s*\d{13,15}/i,
    /кпп\s*:?\s*\d{9}/i,
    /юридический\s*адрес/i,
    /ооо\s*["«]?[^"»]{2,50}["»]?/i,
    /ип\s+[а-яё]+/i,
  ];

  const hasRequisites = requisitePatterns.some(p => p.test(html));

  return {
    id: "INF-002",
    name: "Реквизиты компании",
    category: "fz149",
    status: hasRequisites ? "passed" : "warning",
    description: "Наличие юридических реквизитов (ИНН, ОГРН)",
    details: hasRequisites 
      ? "Юридические реквизиты найдены"
      : "Юридические реквизиты (ИНН/ОГРН) не найдены",
  };
}

function checkTermsOfService(html: string): AuditCheckResult {
  const termsPatterns = [
    /пользовательское\s*соглашение/i,
    /terms\s*(of\s*)?service/i,
    /условия\s*использования/i,
    /правила\s*(пользования|сервиса)/i,
    /оферт[аыу]/i,
    /договор\s*оферт/i,
  ];

  const hasTerms = termsPatterns.some(p => p.test(html));

  return {
    id: "LEG-001",
    name: "Пользовательское соглашение",
    category: "legal",
    status: hasTerms ? "passed" : "warning",
    description: "Наличие условий использования сервиса",
    details: hasTerms 
      ? "Ссылка на пользовательское соглашение найдена"
      : "Пользовательское соглашение не найдено",
  };
}

function checkTrackers(html: string): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  
  const hasGoogleAnalytics = /google-analytics\.com|gtag|ga\s*\(|GoogleAnalyticsObject/i.test(html);
  const hasYandexMetrika = /mc\.yandex\.ru|ym\s*\(|yandex.*metrika/i.test(html);
  const hasFacebookPixel = /facebook\.net|fbq\s*\(|fb-pixel/i.test(html);

  if (hasGoogleAnalytics) {
    results.push({
      id: "COOK-002",
      name: "Google Analytics",
      category: "cookies",
      status: "warning",
      description: "Использование Google Analytics",
      details: "Google Analytics обнаружен - требуется согласие пользователя по ФЗ-152",
    });
  }

  if (hasYandexMetrika) {
    results.push({
      id: "COOK-003",
      name: "Яндекс.Метрика",
      category: "cookies",
      status: "warning",
      description: "Использование Яндекс.Метрики",
      details: "Яндекс.Метрика обнаружена - рекомендуется получить согласие на трекинг",
    });
  }

  if (hasFacebookPixel) {
    results.push({
      id: "COOK-004",
      name: "Facebook Pixel",
      category: "cookies",
      status: "warning",
      description: "Использование Facebook Pixel",
      details: "Facebook Pixel обнаружен - требуется согласие пользователя",
    });
  }

  return results;
}


function runLevel1Checks(data: WebsiteData): AuditCheckResult[] {
  const results: AuditCheckResult[] = [];
  
  if (data.error) {
    results.push({
      id: "ERR-001",
      name: "Доступность сайта",
      category: "technical",
      status: "failed",
      description: "Проверка доступности сайта",
      details: `Ошибка при загрузке: ${data.error}`,
    });
    return results;
  }

  results.push(checkHttps(data));
  results.push(...checkSecurityHeaders(data));
  results.push(checkPrivacyPolicy(data.html));
  results.push(checkConsentCheckbox(data.html));
  results.push(checkCookieBanner(data.html));
  results.push(checkContactInfo(data.html));
  results.push(checkCompanyRequisites(data.html));
  results.push(checkTermsOfService(data.html));
  results.push(...checkTrackers(data.html));

  return results;
}

async function runLevel2Analysis(
  url: string, 
  html: string, 
  level1Results: AuditCheckResult[],
  aiMode: AuditAiMode = "gigachat_only"
): Promise<{ additionalChecks: AuditCheckResult[]; summary: string; recommendations: string[] }> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const gigachatKey = process.env.GIGACHAT_API_KEY;

  if (aiMode === "none") {
    return {
      additionalChecks: [],
      summary: "ИИ-анализ отключен",
      recommendations: [],
    };
  }

  const needsGigaChat = aiMode === "gigachat_only" || aiMode === "hybrid";
  const needsOpenAI = aiMode === "openai_only" || aiMode === "hybrid";

  if (needsGigaChat && !gigachatKey && needsOpenAI && !openaiKey) {
    return {
      additionalChecks: [],
      summary: "ИИ-анализ недоступен: не настроены API ключи",
      recommendations: ["Настройте OPENAI_API_KEY или GIGACHAT_API_KEY для глубокого анализа"],
    };
  }

  if (aiMode === "gigachat_only" && !gigachatKey) {
    return {
      additionalChecks: [],
      summary: "GigaChat недоступен: не настроен GIGACHAT_API_KEY",
      recommendations: ["Настройте GIGACHAT_API_KEY для анализа"],
    };
  }

  if (aiMode === "openai_only" && !openaiKey) {
    return {
      additionalChecks: [],
      summary: "OpenAI недоступен: не настроен OPENAI_API_KEY",
      recommendations: ["Настройте OPENAI_API_KEY для анализа"],
    };
  }

  const failedChecks = level1Results.filter(r => r.status === "failed" || r.status === "warning");
  
  const htmlSnippet = html.substring(0, 15000);

  const systemPrompt = `Ты - эксперт по соответствию сайтов требованиям ФЗ-152 (О персональных данных) и ФЗ-149 (Об информации).

Проанализируй HTML страницы и результаты автоматических проверок. Определи:
1. Есть ли нарушения законодательства о персональных данных
2. Соответствует ли сайт требованиям по cookies и согласию
3. Достаточна ли политика конфиденциальности

Ответь в JSON формате:
{
  "summary": "Краткое резюме соответствия сайта (2-3 предложения на русском)",
  "recommendations": ["Рекомендация 1", "Рекомендация 2", ...],
  "additional_issues": [
    {
      "id": "AI-001",
      "name": "Название проблемы",
      "status": "warning или failed",
      "details": "Описание проблемы"
    }
  ]
}`;

  const userPrompt = `URL сайта: ${url}

Результаты автоматических проверок:
${failedChecks.map(c => `- ${c.name}: ${c.status} - ${c.details}`).join("\n")}

HTML страницы (фрагмент):
${htmlSnippet}`;

  const parseAIResult = (result: any): { additionalChecks: AuditCheckResult[]; summary: string; recommendations: string[] } => {
    const additionalChecks: AuditCheckResult[] = (result.additional_issues || []).map((issue: any) => ({
      id: issue.id || `AI-${Date.now()}`,
      name: issue.name,
      category: "ai_analysis",
      status: issue.status === "failed" ? "failed" : "warning",
      description: "ИИ-анализ",
      details: issue.details,
    }));

    return {
      additionalChecks,
      summary: result.summary || "Анализ завершен",
      recommendations: result.recommendations || [],
    };
  };

  // Helper functions for AI calls
  const callOpenAI = async (): Promise<any | null> => {
    if (!openaiKey) return null;
    try {
      console.log("Using OpenAI for AI analysis");
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error: any) {
      console.error("OpenAI analysis error:", error);
      return null;
    }
  };

  const callGigaChatProvider = async (): Promise<any | null> => {
    if (!gigachatKey) return null;
    try {
      console.log("Using GigaChat for AI analysis");
      const result = await callGigaChat(systemPrompt, userPrompt);
      return result;
    } catch (error: any) {
      console.error("GigaChat analysis error:", error);
      return null;
    }
  };

  // Execute based on aiMode
  if (aiMode === "gigachat_only") {
    const result = await callGigaChatProvider();
    if (result) {
      return parseAIResult(result);
    }
  } else if (aiMode === "openai_only") {
    const result = await callOpenAI();
    if (result) {
      return parseAIResult(result);
    }
  } else if (aiMode === "hybrid") {
    // In hybrid mode, try OpenAI first (priority), then fallback to GigaChat
    let result = await callOpenAI();
    if (result) {
      console.log("Hybrid mode: OpenAI succeeded");
      return parseAIResult(result);
    }
    
    console.log("Hybrid mode: OpenAI failed, trying GigaChat");
    result = await callGigaChatProvider();
    if (result) {
      return parseAIResult(result);
    }
  }

  return {
    additionalChecks: [],
    summary: "Базовый анализ завершен. ИИ-анализ недоступен.",
    recommendations: failedChecks.length > 0 
      ? ["Устраните выявленные нарушения перед повторной проверкой"]
      : ["Сайт соответствует базовым требованиям"],
  };
}

function calculateScore(checks: AuditCheckResult[]): { 
  scorePercent: number; 
  severity: "low" | "medium" | "high";
  passedCount: number;
  warningCount: number;
  failedCount: number;
} {
  const passedCount = checks.filter(c => c.status === "passed").length;
  const warningCount = checks.filter(c => c.status === "warning").length;
  const failedCount = checks.filter(c => c.status === "failed").length;
  const totalCount = checks.length;

  let score = 0;
  if (totalCount > 0) {
    score = Math.round(((passedCount * 1 + warningCount * 0.5) / totalCount) * 100);
    score = Math.max(0, Math.min(100, score));
  }

  let severity: "low" | "medium" | "high" = "low";
  if (failedCount >= 5 || score < 50) severity = "high";
  else if (failedCount >= 2 || score < 70) severity = "medium";

  return { scorePercent: score, severity, passedCount, warningCount, failedCount };
}

export async function checkWebsiteExists(url: string): Promise<{ exists: boolean; error?: string }> {
  const data = await fetchWebsite(url, 10000);
  
  if (data.error) {
    if (data.error.includes("ENOTFOUND") || data.error.includes("getaddrinfo")) {
      return { exists: false, error: "Сайт не найден. Проверьте правильность адреса." };
    }
    if (data.error.includes("ECONNREFUSED")) {
      return { exists: false, error: "Сайт не отвечает. Возможно, сервер отключен." };
    }
    if (data.error.includes("timeout") || data.error.includes("Timeout")) {
      return { exists: false, error: "Превышено время ожидания ответа от сайта." };
    }
    if (data.error.includes("CERT") || data.error.includes("SSL")) {
      return { exists: true };
    }
    return { exists: false, error: `Ошибка подключения: ${data.error}` };
  }
  
  if (data.statusCode === 0) {
    return { exists: false, error: "Не удалось подключиться к сайту." };
  }
  
  // Any HTTP response (including 4xx/5xx) means the server exists and responded
  // We only fail if we couldn't connect at all
  return { exists: true };
}

export async function runAudit(
  url: string, 
  options: AuditOptions = {}
): Promise<AuditReport> {
  const { level2 = true, aiMode = "gigachat_only", onProgress } = options;

  onProgress?.(0, []);

  const existsCheck = await checkWebsiteExists(url);
  if (!existsCheck.exists) {
    throw new Error(existsCheck.error || "Сайт недоступен");
  }

  const websiteData = await fetchWebsite(url);
  
  onProgress?.(1, []);

  const level1Results = runLevel1Checks(websiteData);
  
  onProgress?.(2, level1Results);

  let additionalChecks: AuditCheckResult[] = [];
  let summary = "";
  let recommendations: string[] = [];

  if (level2) {
    onProgress?.(3, level1Results);
    
    const level2Results = await runLevel2Analysis(url, websiteData.html, level1Results, aiMode);
    additionalChecks = level2Results.additionalChecks;
    summary = level2Results.summary;
    recommendations = level2Results.recommendations;
    
    onProgress?.(4, [...level1Results, ...additionalChecks]);
  }

  const allChecks = [...level1Results, ...additionalChecks];
  const scores = calculateScore(allChecks);

  onProgress?.(5, allChecks);

  if (!summary) {
    const passedPct = Math.round((scores.passedCount / allChecks.length) * 100);
    summary = `Проверено ${allChecks.length} критериев. Пройдено ${scores.passedCount} (${passedPct}%), предупреждений ${scores.warningCount}, нарушений ${scores.failedCount}.`;
  }

  if (recommendations.length === 0) {
    if (scores.failedCount > 0) {
      recommendations.push("Устраните выявленные критические нарушения");
    }
    if (scores.warningCount > 0) {
      recommendations.push("Рекомендуется исправить предупреждения для повышения уровня соответствия");
    }
    if (scores.passedCount === allChecks.length) {
      recommendations.push("Отлично! Сайт соответствует проверенным требованиям");
    }
  }

  onProgress?.(6, allChecks);

  return {
    url,
    checks: allChecks,
    scorePercent: scores.scorePercent,
    severity: scores.severity,
    passedCount: scores.passedCount,
    warningCount: scores.warningCount,
    failedCount: scores.failedCount,
    totalCount: allChecks.length,
    summary,
    recommendations,
    processedAt: new Date(),
  };
}

export async function runExpressAudit(
  url: string,
  onProgress?: (stage: number, passedCount: number, warningCount: number, failedCount: number) => void
): Promise<AuditReport> {
  const stages = [
    "Подключение к сайту",
    "Проверка SSL сертификата",
    "Анализ политик конфиденциальности",
    "Проверка cookie-баннера",
    "Анализ форм и согласий",
    "Проверка контактов и реквизитов",
    "Формирование отчета",
  ];

  let currentChecks: AuditCheckResult[] = [];
  
  const report = await runAudit(url, {
    level2: false,
    onProgress: (stage, checks) => {
      currentChecks = checks;
      const passed = checks.filter(c => c.status === "passed").length;
      const warnings = checks.filter(c => c.status === "warning").length;
      const failed = checks.filter(c => c.status === "failed").length;
      onProgress?.(stage, passed, warnings, failed);
    },
  });

  return report;
}
