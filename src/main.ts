import { Game, GameObjects, Scene, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private textbox: GameObjects.Text | undefined;

    constructor() {
        super('scene-game');
    }

    create() {
        this.textbox = this.add.text(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Welcome to Phaser X Vite!',
            {
                color: '#FFF',
                fontFamily: 'monospace',
                fontSize: '26px'
            }
        );

        this.textbox.setOrigin(0.5, 0.5);
    }

    update(time: number, delta: number) {
        if (!this.textbox) {
            return;
        }

        this.textbox.rotation += 0.0005 * delta;
    }
}

const config = {
    type: WEBGL,
    width: document.querySelector('div.container')?.clientWidth,
    height: document.querySelector('div.container')?.clientHeight,
    canvas,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            // debug: true
        }
    },
    scene: [
        GameScene
    ]
};

new Game(config);