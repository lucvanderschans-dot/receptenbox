export const siteConfig = {
  name: "Receptenbox",
  description:
    "Bewaar recepten, houd je voorraad bij en deel één boodschappenlijst met je huisgenoten.",
} as const;

export function pageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} | ${siteConfig.name}` : siteConfig.name;
}
