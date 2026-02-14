import { useTranslations } from "next-intl";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { BrandShowcase } from "../_components/BrandShowcase";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface AboutTemplateProps {
  language?: "en" | "ar";
}

/**
 *
 */
const AboutTemplate: React.FC<AboutTemplateProps> = () => {
  const t = useTranslations();

  const values = [
    {
      key: "quality",
      title: t("Pages.About.ValueQuality"),
      text: t("Pages.About.ValueQualityText"),
    },
    {
      key: "creativity",
      title: t("Pages.About.ValueCreativity"),
      text: t("Pages.About.ValueCreativityText"),
    },
    {
      key: "learning",
      title: t("Pages.About.ValueLearning"),
      text: t("Pages.About.ValueLearningText"),
    },
  ];

  const contactInfo = [
    { iconName: "mail", text: t("Pages.Contact.InfoEmail") },
    { iconName: "phone", text: t("Pages.Contact.InfoPhone") },
    { iconName: "location", text: t("Pages.Contact.InfoAddress") },
  ] as const;

  return (
    <>
      {/* Hero Section */}
      <div className="bg-muted">
        <Container className="text-center py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            {t("Pages.About.HeroTitle")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("Pages.About.HeroSubtitle")}
          </p>
        </Container>
      </div>

      {/* Story Section */}
      <Container className="py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t("Pages.About.StoryTitle")}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("Pages.About.StoryP1")}</p>
              <p>{t("Pages.About.StoryP2")}</p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://picsum.photos/seed/aboutus/800/600"
              alt="Team working"
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Container>

      {/* Mission & Values Section */}
      <div className="bg-muted">
        <Container className="py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-primary/10 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-primary mb-4">
                {t("Pages.About.MissionTitle")}
              </h3>
              <p className="text-muted-foreground">{t("Pages.About.MissionText")}</p>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {t("Pages.About.ValuesTitle")}
              </h3>
              <div className="space-y-4">
                {values.map((value) => (
                  <div key={value.key}>
                    <h4 className="font-semibold text-foreground">{value.title}</h4>
                    <p className="text-muted-foreground text-sm">{value.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Contact Section */}
      <div className="bg-background border-t border-border">
        <Container className="py-16 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{t("Pages.Contact.Title")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("Pages.Contact.Subtitle")}
            </p>
          </div>
          <Card className="mt-12 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-8">
                  <h3 className="text-xl font-bold">{t("Pages.Contact.InfoTitle")}</h3>
                  {contactInfo.map(({ iconName, text }) => (
                    <div key={text} className="flex items-start gap-4">
                      <Icon name={iconName} className="w-6 h-6 text-primary mt-1" />
                      <p className="text-muted-foreground">{text}</p>
                    </div>
                  ))}
                </div>
                <form className="space-y-6">
                  <h3 className="text-xl font-bold">{t("Pages.Contact.FormTitle")}</h3>
                  <div>
                    <Label htmlFor="contact_name" className="sr-only">
                      {t("Pages.Contact.FormName")}
                    </Label>
                    <Input
                      type="text"
                      id="contact_name"
                      placeholder={t("Pages.Contact.FormName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email" className="sr-only">
                      {t("Pages.Contact.FormEmail")}
                    </Label>
                    <Input
                      type="email"
                      id="contact_email"
                      placeholder={t("Pages.Contact.FormEmail")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_subject" className="sr-only">
                      {t("Pages.Contact.FormSubject")}
                    </Label>
                    <Input
                      type="text"
                      id="contact_subject"
                      placeholder={t("Pages.Contact.FormSubject")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_message" className="sr-only">
                      {t("Pages.Contact.FormMessage")}
                    </Label>
                    <Textarea
                      id="contact_message"
                      placeholder={t("Pages.Contact.FormMessage")}
                      rows={4}
                    ></Textarea>
                  </div>
                  <Button size="lg" className="w-full">
                    {t("Pages.Contact.FormSend")}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default AboutTemplate;
