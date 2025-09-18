/**
 * Configurazione Tema Visivo Moderno 2024
 * Design System basato su tendenze UI/UX contemporanee
 */
export const ThemeConfig = {
    // Palette principale - Tema Moderno Glassmorphism + Neumorphism
    colors: {
        // Sfondi - Glassmorphism
        background: {
            primary: 'rgba(5, 5, 15, 0.95)',     // Nero trasparente con blur
            secondary: 'rgba(15, 15, 25, 0.8)',  // Grigio scuro glassmorphism
            tertiary: 'rgba(25, 25, 35, 0.6)',   // Grigio più chiaro
            panel: 'rgba(10, 10, 20, 0.9)',      // Pannelli con glassmorphism
            card: 'rgba(20, 20, 30, 0.7)',       // Carte con trasparenza
            glass: 'rgba(255, 255, 255, 0.05)',  // Effetto vetro
            blur: 'rgba(0, 0, 0, 0.3)'           // Overlay blur
        },
        
        // Accenti - Colori vibranti moderni
        accent: {
            primary: '#00f5ff',      // Ciano neon brillante
            secondary: '#ff0080',    // Magenta vibrante
            tertiary: '#8b5cf6',     // Viola moderno
            success: '#00ff88',      // Verde neon
            warning: '#ffaa00',      // Arancione brillante
            danger: '#ff3366',       // Rosso moderno
            info: '#0099ff',         // Blu elettrico
            gradient: 'linear-gradient(135deg, #00f5ff 0%, #ff0080 100%)'
        },
        
        // Testi - Tipografia moderna
        text: {
            primary: '#ffffff',      // Bianco puro
            secondary: '#e0e0e0',    // Grigio molto chiaro
            muted: '#a0a0a0',        // Grigio medio
            accent: '#00f5ff',       // Ciano neon per testi importanti
            success: '#00ff88',      // Verde neon per successi
            warning: '#ffaa00',      // Arancione per avvisi
            danger: '#ff3366',       // Rosso moderno per errori
            glow: '#ffffff'          // Testo con bagliore
        },
        
        // Bordi - Linee moderne
        border: {
            primary: 'rgba(255, 255, 255, 0.1)',    // Grigio trasparente
            accent: '#00f5ff',                      // Ciano neon
            success: '#00ff88',                     // Verde neon
            warning: '#ffaa00',                     // Arancione
            danger: '#ff3366',                      // Rosso moderno
            glass: 'rgba(255, 255, 255, 0.2)'      // Bordo vetro
        },
        
        // Effetti speciali moderni
        effects: {
            glow: {
                primary: '0 0 20px rgba(0, 245, 255, 0.5)',
                secondary: '0 0 20px rgba(255, 0, 128, 0.5)',
                success: '0 0 15px rgba(0, 255, 136, 0.4)',
                danger: '0 0 15px rgba(255, 51, 102, 0.4)'
            },
            shadow: {
                soft: '0 4px 20px rgba(0, 0, 0, 0.3)',
                medium: '0 8px 30px rgba(0, 0, 0, 0.4)',
                strong: '0 12px 40px rgba(0, 0, 0, 0.5)',
                inner: 'inset 0 2px 10px rgba(0, 0, 0, 0.2)'
            },
            blur: {
                light: 'blur(8px)',
                medium: 'blur(16px)',
                strong: 'blur(24px)'
            }
        }
    },
    
    // Tipografia moderna 2024
    typography: {
        fontFamily: {
            primary: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
            display: '"Space Grotesk", "Inter", sans-serif'
        },
        sizes: {
            xs: '11px',
            sm: '13px',
            base: '15px',
            lg: '17px',
            xl: '19px',
            '2xl': '22px',
            '3xl': '28px',
            '4xl': '36px',
            '5xl': '48px'
        },
        weights: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800'
        },
        lineHeight: {
            tight: '1.2',
            normal: '1.5',
            relaxed: '1.75'
        }
    },
    
    // Spaziature moderne (basate su 8px grid)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px'
    },
    
    // Bordi moderni
    borders: {
        radius: {
            none: '0',
            sm: '6px',
            md: '12px',
            lg: '16px',
            xl: '24px',
            full: '9999px'
        },
        width: {
            thin: '1px',
            normal: '2px',
            thick: '3px',
            heavy: '4px'
        }
    },
    
    // Effetti moderni
    effects: {
        backdrop: {
            light: 'blur(8px) saturate(180%)',
            medium: 'blur(16px) saturate(200%)',
            strong: 'blur(24px) saturate(220%)'
        },
        animation: {
            fast: '150ms ease-out',
            normal: '250ms ease-out',
            slow: '400ms ease-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }
    }
};

/**
 * Utility per applicare stili moderni 2024
 */
export class ThemeUtils {
    static drawPanel(ctx, x, y, width, height, options = {}) {
        const theme = ThemeConfig;
        const {
            background = theme.colors.background.panel,
            border = theme.colors.border.primary,
            borderWidth = theme.borders.width.normal,
            radius = theme.borders.radius.md,
            shadow = true,
            glow = null,
            blur = false
        } = options;
        
        ctx.save();
        
        // Effetto blur/backdrop
        if (blur) {
            ctx.filter = theme.effects.backdrop.light;
        }
        
        // Ombra moderna
        if (shadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;
        }
        
        // Bagliore neon
        if (glow) {
            ctx.shadowColor = glow;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Sfondo con glassmorphism
        ctx.fillStyle = background;
        if (radius > 0) {
            this.drawRoundedRect(ctx, x, y, width, height, radius);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, width, height);
        }
        
        // Bordo moderno
        ctx.strokeStyle = border;
        ctx.lineWidth = borderWidth;
        if (radius > 0) {
            this.drawRoundedRect(ctx, x, y, width, height, radius);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, width, height);
        }
        
        ctx.restore();
    }
    
    static drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    static drawButton(ctx, x, y, width, height, text, options = {}) {
        const theme = ThemeConfig;
        const {
            variant = 'primary', // primary, secondary, ghost, danger
            size = 'md', // sm, md, lg
            isHovered = false,
            isActive = false,
            disabled = false
        } = options;
        
        // Configurazione basata su variant
        let bgColor, borderColor, textColor, glow;
        const radius = theme.borders.radius[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'];
        
        switch (variant) {
            case 'primary':
                bgColor = isActive ? theme.colors.accent.primary : 
                         isHovered ? theme.colors.accent.secondary : 
                         theme.colors.accent.primary;
                borderColor = theme.colors.accent.primary;
                textColor = '#000000';
                glow = theme.colors.accent.primary;
                break;
            case 'secondary':
                bgColor = isActive ? theme.colors.background.tertiary : 
                         isHovered ? theme.colors.background.card : 
                         theme.colors.background.card;
                borderColor = theme.colors.border.accent;
                textColor = theme.colors.text.primary;
                glow = isHovered ? theme.colors.accent.primary : null;
                break;
            case 'ghost':
                bgColor = isActive ? theme.colors.background.glass : 
                         isHovered ? theme.colors.background.glass : 
                         'transparent';
                borderColor = 'transparent';
                textColor = theme.colors.text.primary;
                break;
            case 'danger':
                bgColor = isActive ? theme.colors.accent.danger : 
                         isHovered ? theme.colors.accent.warning : 
                         theme.colors.accent.danger;
                borderColor = theme.colors.accent.danger;
                textColor = '#000000';
                glow = theme.colors.accent.danger;
                break;
        }
        
        // Disegna pannello moderno
        this.drawPanel(ctx, x, y, width, height, {
            background: disabled ? theme.colors.background.tertiary : bgColor,
            border: disabled ? theme.colors.border.primary : borderColor,
            radius: radius,
            glow: disabled ? null : glow,
            blur: variant === 'ghost'
        });
        
        // Testo moderno
        const fontSize = theme.typography.sizes[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'];
        this.drawText(ctx, text, x + width / 2, y + height / 2, {
            color: disabled ? theme.colors.text.muted : textColor,
            size: fontSize,
            weight: theme.typography.weights.semibold,
            align: 'center',
            baseline: 'middle'
        });
    }
    
    static drawText(ctx, text, x, y, options = {}) {
        const theme = ThemeConfig;
        const {
            color = theme.colors.text.primary,
            size = theme.typography.sizes.base,
            weight = theme.typography.weights.normal,
            align = 'left',
            baseline = 'top',
            glow = false,
            gradient = false
        } = options;
        
        ctx.save();
        
        // Effetto bagliore per testi importanti
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Gradiente per testi speciali
        if (gradient) {
            const gradientObj = ctx.createLinearGradient(x, y, x + 100, y);
            gradientObj.addColorStop(0, theme.colors.accent.primary);
            gradientObj.addColorStop(1, theme.colors.accent.secondary);
            ctx.fillStyle = gradientObj;
        } else {
            ctx.fillStyle = color;
        }
        
        // Font moderno
        ctx.font = `${weight} ${size} ${theme.typography.fontFamily.primary}`;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }
    
    // Nuova funzione per barre di progresso moderne
    static drawProgressBar(ctx, x, y, width, height, progress, options = {}) {
        const theme = ThemeConfig;
        const {
            variant = 'primary', // primary, success, warning, danger
            showText = true,
            animated = false
        } = options;
        
        const radius = theme.borders.radius.sm;
        const progressWidth = Math.max(0, Math.min(1, progress)) * (width - 2);
        
        // Sfondo
        this.drawPanel(ctx, x, y, width, height, {
            background: theme.colors.background.tertiary,
            border: theme.colors.border.primary,
            radius: radius
        });
        
        // Barra di progresso
        if (progressWidth > 0) {
            let progressColor;
            switch (variant) {
                case 'success': progressColor = theme.colors.accent.success; break;
                case 'warning': progressColor = theme.colors.accent.warning; break;
                case 'danger': progressColor = theme.colors.accent.danger; break;
                default: progressColor = theme.colors.accent.primary; break;
            }
            
            ctx.fillStyle = progressColor;
            this.drawRoundedRect(ctx, x + 1, y + 1, progressWidth, height - 2, radius - 1);
            ctx.fill();
            
            // Effetto bagliore
            ctx.shadowColor = progressColor;
            ctx.shadowBlur = 8;
            ctx.fill();
        }
        
        // Testo percentuale
        if (showText) {
            const percentage = Math.round(progress * 100);
            this.drawText(ctx, `${percentage}%`, x + width / 2, y + height / 2, {
                color: theme.colors.text.primary,
                size: theme.typography.sizes.sm,
                weight: theme.typography.weights.semibold,
                align: 'center',
                baseline: 'middle'
            });
        }
    }
}
