import { describe, expect, it } from "vitest";
import { pageTitle, siteConfig } from "@/lib/site";

describe("pageTitle", () => {
  it("returns the site name when no page is given", () => {
    expect(pageTitle()).toBe(siteConfig.name);
  });

  it("prefixes the page name", () => {
    expect(pageTitle("Recepten")).toBe("Recepten | Receptenbox");
  });

  it("trims surrounding whitespace from the page name", () => {
    expect(pageTitle("  Voorraad  ")).toBe("Voorraad | Receptenbox");
  });

  it("falls back to the site name for blank input", () => {
    expect(pageTitle("   ")).toBe(siteConfig.name);
  });
});
