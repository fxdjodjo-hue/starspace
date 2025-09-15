// Sistema per visualizzare i numeri di danno fluttuanti
export class DamageNumber {
    constructor(entity, damage, type = 'outgoing') {
        this.entity = entity; // Riferimento all'entità (nave o nemico)
        this.damage = Math.round(damage);
        this.type = type; // 'outgoing' o 'incoming'
        this.alpha = 1.0;
        this.scale = 1.0;
        this.lifetime = 180; // 3 secondi a 60 FPS
        this.offsetY = -40; // Offset verticale sopra l'entità
    }

    update() {
        if (!this.entity || !this.entity.active) {
            return false; // Rimuovi il numero se l'entità non è più attiva
        }

        // Diminuisci l'alpha gradualmente
        // Mantieni l'alpha a 1 per i primi 2 secondi, poi dissolvenza nell'ultimo secondo
        this.alpha = this.lifetime > 60 ? 1 : this.lifetime / 60;

        // Scala leggermente mentre svanisce
        this.scale = 0.8 + (this.lifetime / 60) * 0.4;

        // Riduci il lifetime
        this.lifetime--;

        // Fai fluttuare leggermente l'offset verticale
        this.offsetY = -40 - (Math.sin(this.lifetime * 0.05) * 5);

        return this.lifetime > 0;
    }

    draw(ctx, camera) {
        if (!this.entity || !this.entity.active) return;
        
        // Usa la posizione dell'entità invece di una posizione fissa
        const screenX = this.entity.x - camera.x;
        const screenY = this.entity.y - camera.y + this.offsetY;

        ctx.save();
        
        // Imposta lo stile in base al tipo di danno
        switch(this.type) {
            case 'outgoing':
                ctx.fillStyle = '#ff3333'; // Rosso per danno inflitto
                break;
            case 'incoming':
                ctx.fillStyle = '#ffffff'; // Bianco per danno ricevuto
                break;
            case 'shield':
                ctx.fillStyle = '#4A90E2'; // Blu per danno allo scudo
                break;
            default:
                ctx.fillStyle = '#ffffff';
        }
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

    addNumber(entity, damage, type = 'outgoing') {
        this.numbers.push(new DamageNumber(entity, damage, type));
    }

    update() {
        this.numbers = this.numbers.filter(number => number.update());
    }

    draw(ctx, camera) {
        this.numbers.forEach(number => number.draw(ctx, camera));
    }
}
