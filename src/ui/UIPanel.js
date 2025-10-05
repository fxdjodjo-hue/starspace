export class UIPanel {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.x = 0;
        this.y = 0;
        this.width = this.game.canvas.width;
        this.height = this.game.canvas.height;
    }

    show() {
        this.visible = true;
        this.centerPanel();
    }

    hide() {
        this.visible = false;
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Centra il pannello
    centerPanel() {
        this.x = 0;
        this.y = 0;
        this.width = this.game.canvas.width;
        this.height = this.game.canvas.height;
    }

    // Da implementare nelle sottoclassi
    draw(ctx) {}

    // Da implementare nelle sottoclassi se necessario
    handleClick(x, y) {
        return false;
    }

    // Da implementare nelle sottoclassi se necessario
    handleMouseMove(x, y) {}

    // Da implementare nelle sottoclassi se necessario
    update() {}
}
