import { Link } from '@i18n/navigation';
import { Button } from '@findeg/ui';
import { Container } from '@findeg/ui';

interface ErrorPageProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Common Error / Exception presentation with optional working retry.
 */
export default function ErrorPage({
  title = 'Page not found',
  subtitle = 'The page you are looking for does not exist.',
  ctaLabel = 'Back to Home',
  ctaHref = '/',
  onRetry,
  retryLabel = 'Try again',
}: ErrorPageProps) {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
      <div className="mt-6 flex items-center justify-center gap-4">
        {onRetry && (
          <Button onClick={onRetry} variant="default" data-testid="error-retry-button">
            {retryLabel}
          </Button>
        )}
        <Button asChild variant={onRetry ? 'outline' : 'default'}>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </Container>
  );
}
