interface ScrollingLogoCloudProps {
  direction?: "left" | "right";
}

const brands = ["Faber-Castell", "Staedtler", "M&G", "Mintra", "Maped", "Deli"];

/**
 *
 */
export function ScrollingLogoCloud({ direction = "left" }: ScrollingLogoCloudProps) {
  const ordered = direction === "left" ? brands : [...brands].reverse();
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {ordered.map((brand) => (
        <span
          key={`${direction}-${brand}`}
          className="rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground"
        >
          {brand}
        </span>
      ))}
    </div>
  );
}
