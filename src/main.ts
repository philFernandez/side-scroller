import { Game, GameObjects, Physics, Scene, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private platforms: Physics.Arcade.StaticGroup | undefined;

    constructor() {
        super('scene-game');
    }

    preload() {
        this.load.image('sky', '/assets/sky.png');
        this.load.image('ground', '/assets/platform.png');
    }

    create() {
        let { width, height } = this.sys.game.canvas;

        this.add.image(width / 2, height / 2, 'sky').setDisplaySize(width, height);

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(width / 2, height - (height / 40), 'ground').setDisplaySize(width, height / 20).refreshBody();
    }

    update() {
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