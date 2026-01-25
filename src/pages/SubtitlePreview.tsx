import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const subtitleOptions = [
  {
    name: "Playfair Display Italic (Attuale)",
    fontFamily: "'Playfair Display', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Elegante, classico, corsivo raffinato",
  },
  {
    name: "EB Garamond Italic",
    fontFamily: "'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Tradizionale, classico italiano, corsivo elegante",
  },
  {
    name: "Cormorant Garamond Italic",
    fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Moderno ma classico, corsivo leggibile",
  },
  {
    name: "Lora Italic",
    fontFamily: "'Lora', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Bilanciato, elegante, corsivo versatile",
  },
  {
    name: "Crimson Text Italic",
    fontFamily: "'Crimson Text', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Classico, letterpress style, corsivo tradizionale",
  },
  {
    name: "Libre Baskerville Italic",
    fontFamily: "'Libre Baskerville', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Tradizionale, formale, corsivo elegante",
  },
  {
    name: "Merriweather Italic",
    fontFamily: "'Merriweather', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Leggibile, moderno, corsivo professionale",
  },
  {
    name: "PT Serif Italic",
    fontFamily: "'PT Serif', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Pulito, moderno, corsivo internazionale",
  },
  {
    name: "Alegreya Italic",
    fontFamily: "'Alegreya', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Elegante, letteratura, corsivo raffinato",
  },
  {
    name: "Cormorant Italic",
    fontFamily: "'Cormorant', 'EB Garamond', Georgia, serif",
    fontStyle: "italic",
    description: "Elegante, calligrafico, corsivo artistico",
  },
];

export default function SubtitlePreview() {
  return (
    <AppLayout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">
            Preview Font "Corzano e Paterno"
          </h1>
          <p className="text-muted-foreground">
            Confronta le diverse opzioni di font corsivo per il sottotitolo
          </p>
        </div>

        <div className="grid gap-6">
          {subtitleOptions.map((option, index) => (
            <motion.div
              key={option.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {option.name}
                </h3>
                <p className="text-xs text-muted-foreground/70">
                  {option.description}
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Logo completo */}
                <div className="flex items-center gap-4">
                  <img 
                    src="/frog-logo.svg" 
                    alt="Dario Frog" 
                    className="h-16 w-16 flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span 
                      className="text-2xl tracking-widest uppercase"
                      style={{ 
                        color: '#8B7355',
                        fontFamily: "'Alegreya', 'EB Garamond', Georgia, serif",
                        fontWeight: 700,
                        letterSpacing: '0.1em'
                      }}
                    >
                      DARIO
                    </span>
                    <span 
                      className="text-xs tracking-wide"
                      style={{ 
                        color: '#8B2E3D',
                        fontFamily: option.fontFamily,
                        fontStyle: option.fontStyle,
                        fontWeight: 400
                      }}
                    >
                      Corzano e Paterno
                    </span>
                  </div>
                </div>

                {/* Solo sottotitolo più grande per vedere meglio */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Solo sottotitolo (ingrandito):</p>
                  <span 
                    className="text-lg tracking-wide"
                    style={{ 
                      color: '#8B2E3D',
                      fontFamily: option.fontFamily,
                      fontStyle: option.fontStyle,
                      fontWeight: 400
                    }}
                  >
                    Corzano e Paterno
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
