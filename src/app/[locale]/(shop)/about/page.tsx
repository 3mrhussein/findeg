import { Container } from "@/components/layout/Container";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

/**
 *
 */
export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale });

  return (
    <main className="bg-background py-10 md:py-14">
      <Container className="space-y-10">
        <section className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">{t("Pages.About.HeroTitle")}</h1>
          <p className="text-muted-foreground md:text-lg">{t("Pages.About.HeroSubtitle")}</p>
        </section>

        <section className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-2xl font-semibold">{t("Pages.About.StoryTitle")}</h2>
          <p className="text-muted-foreground leading-7">{t("Pages.About.StoryP1")}</p>
          <p className="text-muted-foreground leading-7">{t("Pages.About.StoryP2")}</p>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">{t("Pages.About.MissionTitle")}</h2>
          <p className="text-muted-foreground leading-7">{t("Pages.About.MissionText")}</p>
        </section>

        <section className="mx-auto max-w-5xl space-y-4">
          <h2 className="text-2xl font-semibold">{t("Pages.About.ValuesTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{t("Pages.About.ValueQuality")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("Pages.About.ValueQualityText")}
              </p>
            </article>
            <article className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{t("Pages.About.ValueCreativity")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("Pages.About.ValueCreativityText")}
              </p>
            </article>
            <article className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{t("Pages.About.ValueLearning")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("Pages.About.ValueLearningText")}
              </p>
            </article>
          </div>
        </section>

        <section id="careers" className="mx-auto max-w-4xl space-y-3 rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">{t("Layout.Footer.AboutCareers")}</h2>
          <p className="text-muted-foreground">{t("Pages.About.MissionText")}</p>
        </section>

        <section id="contact" className="mx-auto max-w-4xl space-y-3 rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">{t("Layout.Footer.AboutContact")}</h2>
          <p className="text-muted-foreground">{t("Pages.Contact.Subtitle")}</p>
        </section>
      </Container>
    </main>
  );
}
