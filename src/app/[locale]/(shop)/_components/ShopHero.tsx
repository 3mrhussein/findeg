import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface HeroProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

/**
 *
 */
export function Hero({
  imageUrl,
  title,
  subtitle,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroProps) {
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container>
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">{title}</h1>
          <p className="mt-4 text-lg text-white/90">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/50 text-white">
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
