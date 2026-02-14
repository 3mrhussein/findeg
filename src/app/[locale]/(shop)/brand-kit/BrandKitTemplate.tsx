import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 *
 */
const ColorSwatch = ({
  name,
  colorClass,
  hex,
}: {
  name: string;
  colorClass: string;
  hex: string;
}) => (
  <div className="flex items-center gap-4">
    <div className={`w-16 h-16 rounded-lg ${colorClass} border`}></div>
    <div>
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-muted-foreground">{hex}</p>
    </div>
  </div>
);

interface BrandKitTemplateProps {
  language?: "en" | "ar";
}

/**
 *
 */
const BrandKitTemplate: React.FC<BrandKitTemplateProps> = () => {
  const t = useTranslations();

  const lightColors = [
    { name: "Primary", class: "bg-primary", hex: "#14b8a6" },
    { name: "Secondary", class: "bg-secondary", hex: "#f59e0b" },
    { name: "Background", class: "bg-background", hex: "#ffffff" },
    { name: "Foreground", class: "bg-foreground", hex: "#111827" },
    { name: "Card", class: "bg-card", hex: "#ffffff" },
    { name: "Muted", class: "bg-muted", hex: "#f3f4f6" },
    { name: "Border", class: "bg-border", hex: "#e5e7eb" },
  ];

  const darkColors = [
    { name: "Primary", class: "bg-primary", hex: "#14b8a6" },
    { name: "Secondary", class: "bg-secondary", hex: "#fbbf24" },
    { name: "Background", class: "bg-background", hex: "#111827" },
    { name: "Foreground", class: "bg-foreground", hex: "#f3f4f6" },
    { name: "Card", class: "bg-card", hex: "#1f2937" },
    { name: "Muted", class: "bg-muted", hex: "#374151" },
    { name: "Border", class: "bg-border", hex: "#374151" },
  ];

  return (
    <>
      <div className="bg-muted">
        <Container className="text-center py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            {t("Pages.BrandKit.Title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("Pages.BrandKit.Subtitle")}
          </p>
        </Container>
      </div>

      <Container className="py-16 lg:py-24 space-y-16">
        {/* Logo Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">{t("Pages.BrandKit.LogoTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Light Mode</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-12 bg-card">
                <Logo />
              </CardContent>
            </Card>
            <Card className="dark">
              <CardHeader>
                <CardTitle>Dark Mode</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-12 bg-card">
                <Logo />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Color Palette Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">
            {t("Pages.BrandKit.ColorsTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Light Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {lightColors.map((color) => (
                  <ColorSwatch
                    key={color.name}
                    name={color.name}
                    colorClass={color.class}
                    hex={color.hex}
                  />
                ))}
              </CardContent>
            </Card>
            <Card className="dark">
              <CardHeader>
                <CardTitle>Dark Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {darkColors.map((color) => (
                  <ColorSwatch
                    key={color.name}
                    name={color.name}
                    colorClass={color.class}
                    hex={color.hex}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">
            {t("Pages.BrandKit.TypographyTitle")}
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Poppins</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div>
                <h1 className="text-5xl font-bold">Heading 1 (700)</h1>
                <p className="text-muted-foreground mt-1">
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <h2 className="text-4xl font-semibold">Heading 2 (600)</h2>
                <p className="text-muted-foreground mt-1">
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-medium">Heading 3 (500)</h3>
                <p className="text-muted-foreground mt-1">
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <p className="text-base font-normal">Body text (400)</p>
                <p className="text-muted-foreground mt-1">
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Components Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">
            {t("Pages.BrandKit.ComponentsTitle")}
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <h4 className="font-semibold">Buttons</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Badges</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Badge variant="default">NEW</Badge>
                    <Badge variant="secondary">SALE</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </Container>
    </>
  );
};

export default BrandKitTemplate;
