import { Game, Input, Physics, Scene, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private platforms: Physics.Arcade.StaticGroup | undefined;
    private playerWalk: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    private cursors: Types.Input.Keyboard.CursorKeys | undefined;

    constructor() {
        super('scene-game');
    }

    preload() {
        this.load.image('sky', '/assets/sky.png');
        this.load.image('ground', '/assets/platform.png');
        this.load.spritesheet('player-walk', '/assets/Raider_1/Walk.png', {
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

        this.createPlayer();
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
        this.physics.add.collider(this.playerWalk, this.platforms);
    }

    update() {
        if (this.cursors?.right.isDown && this.cursors?.shift.isUp) {
            this.playerWalk?.setBounce(0.2);
            this.playerWalk?.setFlipX(false);
            this.playerWalk?.setVelocityX(160);
            this.playerWalk?.anims.play('right', true);
        } else if (this.cursors?.left.isDown && this.cursors?.shift.isUp) {
            this.playerWalk?.setBounce(0.2);
            this.playerWalk?.setFlipX(true);
            this.playerWalk?.setVelocityX(-160);
            this.playerWalk?.anims.play('right', true);
        }
        else {
            this.playerWalk?.setVelocityX(0);
            this.playerWalk?.anims.play('still', true);
        }
    }

    private createPlayer() {
        // PlayerWalk
        this.playerWalk = this.physics.add.sprite(100, 450, 'player-walk');
        this.playerWalk.setScale(1.5);
        this.playerWalk.setBounce(0.2);
        // Player animation
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'still',
            frames: [{ key: 'player-walk', frame: 3 }],
            frameRate: 20
        });
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