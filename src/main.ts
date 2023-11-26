import { Game, Input, Physics, Scene, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private platforms: Physics.Arcade.StaticGroup | undefined;
    private player: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    private cursors: Types.Input.Keyboard.CursorKeys | undefined;

    constructor() {
        super('scene-game');
    }

    preload() {
        this.load.image('sky', '/assets/sky.png');
        this.load.image('ground', '/assets/platform.png');
        this.load.spritesheet('player', '/assets/Raider_1/Run.png', {
            frameWidth: 128,
            frameHeight: 128,
        });
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        // Sky
        this.add.image(width / 2, height / 2, 'sky').setDisplaySize(width, height);
        // Ground
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(width / 2, height - (height / 40), 'ground').setDisplaySize(width, height / 20).refreshBody();
        // Player
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setScale(1.5);
        this.player.setBounce(0.2);
        // Player animation
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'still',
            frames: [{ key: 'player', frame: 3 }],
            frameRate: 20
        });
        // Movement keys

        this.cursors = this.input.keyboard?.addKeys({
            'up': Input.Keyboard.KeyCodes.W,
            'left': Input.Keyboard.KeyCodes.A,
            'down': Input.Keyboard.KeyCodes.S,
            'right': Input.Keyboard.KeyCodes.D,
            'space': Input.Keyboard.KeyCodes.SPACE,
            'shift': Input.Keyboard.KeyCodes.SHIFT,
        }) as Types.Input.Keyboard.CursorKeys;

        // Physics
        this.physics.add.collider(this.player, this.platforms);
    }

    update() {
        if (this.cursors?.right.isDown && this.cursors?.shift.isUp) {
            this.player?.setBounce(0.2);
            this.player?.setFlipX(false);
            this.player?.setVelocityX(160);
            this.player?.anims.play('right', true);
        } else if (this.cursors?.left.isDown && this.cursors?.shift.isUp) {
            this.player?.setBounce(0.2);
            this.player?.setFlipX(true);
            this.player?.setVelocityX(-160);
            this.player?.anims.play('right', true);
        }

        else {
            this.player?.setVelocityX(0);
            this.player?.anims.play('still', true);
        }
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
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        GameScene
    ]
};

new Game(config);