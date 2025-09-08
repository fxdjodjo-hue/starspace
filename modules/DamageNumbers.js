// Sistema per visualizzare i numeri di danno fluttuanti
export class DamageNumber {
    constructor(x, y, damage, type = 'outgoing') {
        this.x = x;
        this.y = y;
        this.damage = Math.round(damage);
        this.type = type; // 'outgoing' o 'incoming'
        this.alpha = 1.0;
        this.scale = 1.0;
        this.lifetime = 180; // 3 secondi a 60 FPS
        this.velocity = {
            x: (Math.random() - 0.5) * 2, // Movimento casuale orizzontale
            y: -1 // Movimento verso l'alto più lento
        };
    }

    update() {
        // Aggiorna posizione
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Rallenta il movimento verticale
        this.velocity.y *= 0.98; // Rallenta più gradualmente

        // Diminuisci l'alpha gradualmente
        // Mantieni l'alpha a 1 per i primi 2 secondi, poi dissolvenza nell'ultimo secondo
        this.alpha = this.lifetime > 60 ? 1 : this.lifetime / 60;

        // Scala leggermente mentre svanisce
        this.scale = 0.8 + (this.lifetime / 60) * 0.4;

        // Riduci il lifetime
        this.lifetime--;

        return this.lifetime > 0;
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        
        // Imposta lo stile in base al tipo di danno
        ctx.fillStyle = this.type === 'outgoing' ? '#ff3333' : '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Imposta l'alpha e la scala
        ctx.globalAlpha = this.alpha;
        
        // Applica la scala
        ctx.translate(screenX, screenY);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-screenX, -screenY);
        
        // Imposta il font
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Disegna il testo con outline
        ctx.strokeText(this.damage.toString(), screenX, screenY);
        ctx.fillText(this.damage.toString(), screenX, screenY);
        
        ctx.restore();
    }
}

export class DamageNumberSystem {
    constructor() {
        this.numbers = [];
    }

    addNumber(x, y, damage, type = 'outgoing') {
        this.numbers.push(new DamageNumber(x, y, damage, type));
    }

    update() {
        this.numbers = this.numbers.filter(number => number.update());
    }

    draw(ctx, camera) {
        this.numbers.forEach(number => number.draw(ctx, camera));
    }
}
