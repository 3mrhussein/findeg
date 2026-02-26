import { Container } from "@/components/shared/Container";

/**
 *
 */
export function AdBanner() {
  return (
    <section className="bg-primary py-8 text-primary-foreground">
      <Container>
        <p className="text-center text-lg font-medium">
          Back to School offers are live. Save on featured essentials this week.
        </p>
      </Container>
    </section>
  );
}
