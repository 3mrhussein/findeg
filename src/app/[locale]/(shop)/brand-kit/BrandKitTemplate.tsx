import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

/**
 *
 */
function ColorSwatch({
  name,
  token,
  sampleClassName,
}: {
  name: string;
  token: string;
  sampleClassName: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{token}</p>
      </div>
      <div className={`w-16 h-8 rounded-md border ${sampleClassName}`} />
    </div>
  );
}

interface BrandKitTemplateProps {
  language?: "en" | "ar";
}

/**
 * Living reference for storefront-first visual language.
 */
const BrandKitTemplate: React.FC<BrandKitTemplateProps> = () => {
  const t = useTranslations();

  return (
    <>
      <section className="bg-muted/40">
        <Container className="py-16 lg:py-20 text-center space-y-4">
          <Badge variant="secondary">{t("Pages.BrandKit.StorefrontFirstBadge")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">{t("Pages.BrandKit.Title")}</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">{t("Pages.BrandKit.Subtitle")}</p>
        </Container>
      </section>

      <Container className="py-14 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("Pages.BrandKit.LogoTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">{t("Pages.BrandKit.LogoDescription")}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Pages.BrandKit.ColorsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ColorSwatch name="Primary" token="--primary" sampleClassName="bg-primary" />
              <ColorSwatch name="Secondary" token="--secondary" sampleClassName="bg-secondary" />
              <ColorSwatch name="Background" token="--background" sampleClassName="bg-background" />
              <ColorSwatch name="Accent" token="--accent" sampleClassName="bg-accent" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Pages.BrandKit.TypographyTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold">Display / Headline</p>
              <p className="text-2xl font-semibold">Section Heading</p>
              <p className="text-base">{t("Pages.BrandKit.TypographyBody")}</p>
              <p className="text-sm text-muted-foreground">
                {t("Pages.BrandKit.TypographySupport")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("Pages.BrandKit.ComponentsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>{t("Pages.BrandKit.PrimaryAction")}</Button>
            <Button variant="outline">{t("Pages.BrandKit.SecondaryAction")}</Button>
            <Button variant="ghost">{t("Pages.BrandKit.UtilityAction")}</Button>
            <Badge>{t("Pages.BrandKit.SecondaryFlowBadge")}</Badge>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default BrandKitTemplate;
