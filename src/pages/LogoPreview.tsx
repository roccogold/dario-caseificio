import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const fontOptions = [
  {
    name: "Playfair Display (Attuale)",
    fontFamily: "'Playfair Display', 'EB Garamond', Georgia, serif",
    description: "Elegante, classico, con A arrotondato",
  },
  {
    name: "EB Garamond",
    fontFamily: "'EB Garamond', Georgia, serif",
    description: "Tradizionale, raffinato, classico italiano",
  },
  {
    name: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
    description: "Moderno ma classico, leggibile",
  },
  {
    name: "Lora",
    fontFamily: "'Lora', 'EB Garamond', Georgia, serif",
    description: "Bilanciato, elegante, versatile",
  },
  {
    name: "Crimson Text",
    fontFamily: "'Crimson Text', 'EB Garamond', Georgia, serif",
    description: "Classico, letterpress style",
  },
  {
    name: "Libre Baskerville",
    fontFamily: "'Libre Baskerville', 'EB Garamond', Georgia, serif",
    description: "Tradizionale, formale, elegante",
  },
  {
    name: "Merriweather",
    fontFamily: "'Merriweather', 'EB Garamond', Georgia, serif",
    description: "Leggibile, moderno, professionale",
  },
  {
    name: "PT Serif",
    fontFamily: "'PT Serif', 'EB Garamond', Georgia, serif",
    description: "Pulito, moderno, internazionale",
  },
  {
    name: "Bitter",
    fontFamily: "'Bitter', 'EB Garamond', Georgia, serif",
    description: "Robusto, distintivo, carattere forte",
  },
  {
    name: "Alegreya",
    fontFamily: "'Alegreya', 'EB Garamond', Georgia, serif",
    description: "Elegante, letteratura, raffinato",
  },
];

export default function LogoPreview() {
  return (
    <AppLayout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">
            Preview Font Logo DARIO
          </h1>
          <p className="text-muted-foreground">
            Confronta le diverse opzioni di font per il logo DARIO
          </p>
        </div>

        <div className="grid gap-6">
          {fontOptions.map((font, index) => (
            <motion.div
              key={font.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {font.name}
                </h3>
                <p className="text-xs text-muted-foreground/70">
                  {font.description}
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Logo grande */}
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
                        fontFamily: font.fontFamily,
                        fontWeight: 700,
                        letterSpacing: '0.1em'
                      }}
                    >
                      DARIO
                    </span>
                    <span 
                      className="text-xs tracking-wide font-serif"
                      style={{ color: '#A68B6F' }}
                    >
                      Corzano e Paterno
                    </span>
                  </div>
                </div>

                {/* Logo piccolo (mobile) */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <img 
                    src="/frog-logo.svg" 
                    alt="Dario Frog" 
                    className="h-8 w-8"
                  />
                  <span 
                    className="text-lg tracking-widest uppercase"
                    style={{ 
                      color: '#8B7355',
                      fontFamily: font.fontFamily,
                      fontWeight: 700,
                      letterSpacing: '0.1em'
                    }}
                  >
                    DARIO
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
