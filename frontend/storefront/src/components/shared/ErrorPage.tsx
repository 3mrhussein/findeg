import { Link } from "@i18n/navigation";
import { Button } from "@findeg/ui";
import { Container } from "@findeg/ui";

interface ErrorPageProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 *
 */
export default function ErrorPage({
  title = "Page not found",
  subtitle = "The page you are looking for does not exist.",
  ctaLabel = "Back to Home",
  ctaHref = "/",
}: ErrorPageProps) {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
      <Button asChild className="mt-6">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </Container>
  );
}
