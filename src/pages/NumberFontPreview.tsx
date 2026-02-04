import { AppLayout } from "@/components/layout/AppLayout";

const fontOptions = [
  {
    name: "Current (Playfair Display)",
    fontFamily: "'Playfair Display', 'EB Garamond', Georgia, serif",
    description: "Serif elegante - attuale"
  },
  {
    name: "EB Garamond",
    fontFamily: "'EB Garamond', Georgia, serif",
    description: "Serif classico"
  },
  {
    name: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
    description: "Serif moderno e leggibile"
  },
  {
    name: "Crimson Text",
    fontFamily: "'Crimson Text', 'EB Garamond', Georgia, serif",
    description: "Serif tradizionale"
  },
  {
    name: "Libre Baskerville",
    fontFamily: "'Libre Baskerville', 'EB Garamond', Georgia, serif",
    description: "Serif con numeri tabulari"
  },
  {
    name: "Merriweather",
    fontFamily: "'Merriweather', 'EB Garamond', Georgia, serif",
    description: "Serif leggibile"
  },
  {
    name: "Lora",
    fontFamily: "'Lora', 'EB Garamond', Georgia, serif",
    description: "Serif equilibrato"
  },
  {
    name: "Inter (Sans-serif)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Sans-serif moderno"
  },
  {
    name: "Roboto (Sans-serif)",
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Sans-serif geometrico"
  },
  {
    name: "JetBrains Mono (Monospace)",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    description: "Monospace per numeri uniformi"
  },
  {
    name: "Space Grotesk (Sans-serif)",
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Sans-serif geometrico moderno"
  },
  {
    name: "DM Sans (Sans-serif)",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    description: "Sans-serif pulito"
  }
];

export default function NumberFontPreview() {
  const sampleNumbers = [
    { label: "Litri Totali", value: 500, suffix: " Lt" },
    { label: "Produzioni", value: 2 },
    { label: "Lotto", value: 23212 },
    { label: "Litri", value: 450, suffix: "Lt" },
    { label: "Data", value: 26 },
    { label: "Anno", value: 2026 },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            Preview Font per Numeri
          </h1>
          <p className="text-muted-foreground">
            Confronta diverse opzioni di font per i numeri nell'applicazione
          </p>
        </div>

        <div className="space-y-12">
          {fontOptions.map((font, index) => (
            <div key={index} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {font.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {font.description}
                </p>
              </div>

              {/* Stat Cards Preview */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Litri Totali
                  </p>
                  <p
                    className="text-3xl font-semibold tracking-tight text-card-foreground"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    500 Lt
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Produzioni
                  </p>
                  <p
                    className="text-3xl font-semibold tracking-tight text-card-foreground"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    2
                  </p>
                </div>
              </div>

              {/* Production Card Preview */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-4">
                  <div
                    className="text-2xl font-semibold text-foreground"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    26
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground mb-1">
                      Lotto #23212
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pecorino 50L
                    </div>
                  </div>
                  <div
                    className="text-xl font-semibold text-foreground"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    50 Lt
                  </div>
                </div>
              </div>

              {/* All Sample Numbers */}
              <div className="flex flex-wrap gap-4">
                {sampleNumbers.map((sample, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {sample.label}
                    </p>
                    <p
                      className="text-2xl font-semibold text-foreground"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {sample.value}
                      {sample.suffix}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
