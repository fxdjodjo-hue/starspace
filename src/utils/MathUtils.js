/**
 * Utility matematiche per il gioco
 * Funzioni di supporto per calcoli comuni
 */

/**
 * Calcola la distanza tra due punti
 * @param {number} x1 - X del primo punto
 * @param {number} y1 - Y del primo punto
 * @param {number} x2 - X del secondo punto
 * @param {number} y2 - Y del secondo punto
 * @returns {number} Distanza euclidea
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcola l'angolo tra due punti
 * @param {number} x1 - X del punto di partenza
 * @param {number} y1 - Y del punto di partenza
 * @param {number} x2 - X del punto di arrivo
 * @param {number} y2 - Y del punto di arrivo
 * @returns {number} Angolo in radianti
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Normalizza un angolo tra 0 e 2π
 * @param {number} angle - Angolo in radianti
 * @returns {number} Angolo normalizzato
 */
export function normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

/**
 * Calcola la differenza angolare tra due angoli
 * @param {number} angle1 - Primo angolo
 * @param {number} angle2 - Secondo angolo
 * @returns {number} Differenza angolare (-π, π]
 */
export function angleDifference(angle1, angle2) {
    let diff = angle2 - angle1;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff <= -Math.PI) diff += Math.PI * 2;
    return diff;
}

/**
 * Interpola linearmente tra due valori
 * @param {number} a - Valore iniziale
 * @param {number} b - Valore finale
 * @param {number} t - Fattore di interpolazione (0-1)
 * @returns {number} Valore interpolato
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Interpola linearmente tra due punti
 * @param {Object} p1 - Punto iniziale {x, y}
 * @param {Object} p2 - Punto finale {x, y}
 * @param {number} t - Fattore di interpolazione (0-1)
 * @returns {Object} Punto interpolato {x, y}
 */
export function lerpPoint(p1, p2, t) {
    return {
        x: lerp(p1.x, p2.x, t),
        y: lerp(p1.y, p2.y, t)
    };
}

/**
 * Clampa un valore tra min e max
 * @param {number} value - Valore da clampare
 * @param {number} min - Valore minimo
 * @param {number} max - Valore massimo
 * @returns {number} Valore clampato
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Mappa un valore da un range a un altro
 * @param {number} value - Valore da mappare
 * @param {number} inMin - Minimo del range di input
 * @param {number} inMax - Massimo del range di input
 * @param {number} outMin - Minimo del range di output
 * @param {number} outMax - Massimo del range di output
 * @returns {number} Valore mappato
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Genera un numero casuale tra min e max
 * @param {number} min - Valore minimo
 * @param {number} max - Valore massimo
 * @returns {number} Numero casuale
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Genera un numero intero casuale tra min e max (inclusi)
 * @param {number} min - Valore minimo
 * @param {number} max - Valore massimo
 * @returns {number} Numero intero casuale
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera un punto casuale all'interno di un cerchio
 * @param {number} centerX - X del centro
 * @param {number} centerY - Y del centro
 * @param {number} radius - Raggio del cerchio
 * @returns {Object} Punto casuale {x, y}
 */
export function randomPointInCircle(centerX, centerY, radius) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance
    };
}

/**
 * Genera un punto casuale all'interno di un rettangolo
 * @param {number} x - X del rettangolo
 * @param {number} y - Y del rettangolo
 * @param {number} width - Larghezza del rettangolo
 * @param {number} height - Altezza del rettangolo
 * @returns {Object} Punto casuale {x, y}
 */
export function randomPointInRect(x, y, width, height) {
    return {
        x: x + Math.random() * width,
        y: y + Math.random() * height
    };
}

/**
 * Verifica se un punto è all'interno di un cerchio
 * @param {number} px - X del punto
 * @param {number} py - Y del punto
 * @param {number} cx - X del centro del cerchio
 * @param {number} cy - Y del centro del cerchio
 * @param {number} radius - Raggio del cerchio
 * @returns {boolean} True se il punto è dentro il cerchio
 */
export function pointInCircle(px, py, cx, cy, radius) {
    return distance(px, py, cx, cy) <= radius;
}

/**
 * Verifica se un punto è all'interno di un rettangolo
 * @param {number} px - X del punto
 * @param {number} py - Y del punto
 * @param {number} rx - X del rettangolo
 * @param {number} ry - Y del rettangolo
 * @param {number} width - Larghezza del rettangolo
 * @param {number} height - Altezza del rettangolo
 * @returns {boolean} True se il punto è dentro il rettangolo
 */
export function pointInRect(px, py, rx, ry, width, height) {
    return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
}

/**
 * Calcola la velocità per raggiungere un target in un certo tempo
 * @param {number} currentX - X attuale
 * @param {number} currentY - Y attuale
 * @param {number} targetX - X target
 * @param {number} targetY - Y target
 * @param {number} time - Tempo in secondi
 * @returns {Object} Velocità {vx, vy}
 */
export function calculateVelocity(currentX, currentY, targetX, targetY, time) {
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { vx: 0, vy: 0 };
    
    const speed = distance / time;
    const angle = Math.atan2(dy, dx);
    
    return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
    };
}

/**
 * Formatta un numero con separatori delle migliaia
 * @param {number} num - Numero da formattare
 * @returns {string} Numero formattato
 */
export function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Formatta un numero in formato compatto (K, M, B)
 * @param {number} num - Numero da formattare
 * @returns {string} Numero formattato
 */
export function formatCompactNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Converte gradi in radianti
 * @param {number} degrees - Gradi
 * @returns {number} Radianti
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Converte radianti in gradi
 * @param {number} radians - Radianti
 * @returns {number} Gradi
 */
export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}
