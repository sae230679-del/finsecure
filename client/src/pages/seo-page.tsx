import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Loader2, FileWarning } from "lucide-react";

type SeoPage = {
  id: number;
  slug: string;
  h1: string;
  title: string;
  description: string;
  content: string;
  isActive: boolean;
};

function parseMarkdown(content: string): string {
  let html = content
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/\n/gim, '<br/>');
  
  return `<p class="mb-4">${html}</p>`;
}

export default function SeoPageView() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery<SeoPage>({
    queryKey: ["/api/public/seo", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileWarning className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Страница не найдена</h1>
            <p className="text-muted-foreground mb-4">
              Запрашиваемая страница не существует или была удалена.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <link rel="canonical" href={`https://securelex.ru/seo/${page.slug}`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <article>
            <h1 className="text-3xl font-bold mb-6">{page.h1}</h1>
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(page.content) }}
            />
          </article>
        </main>
        
        <footer className="border-t mt-12 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            SecureLex.ru - Проверка сайтов на соответствие законодательству
          </div>
        </footer>
      </div>
    </>
  );
}
