import { CANVAS, Game, GameObjects, Input, Physics, Scene, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private sky: GameObjects.TileSprite | undefined;
    private platforms: Physics.Arcade.StaticGroup | undefined;
    private player: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
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
        this.load.spritesheet('player-run', '/assets/Raider_1/Run.png', {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet('player-idle', '/assets/Raider_1/Idle.png', {
            frameWidth: 128,
            frameHeight: 128,
        });
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        // Sky
        this.sky = this.add.tileSprite(width / 2, height / 2, 0, 0, 'sky');
        this.sky.setDisplaySize(width * 50, height);
        // Ground
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(width / 2, height - (height / 40), 'ground').setDisplaySize(width * 50, height / 20).refreshBody();

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
        this.physics.add.collider(this.player!, this.platforms);
        this.physics.world.bounds.setTo(0, 0, width * 50, height);

        // Camera 
        this.cameras.main.setBounds(0, 0, width * 50, height);
        this.cameras.main.startFollow(this.player!);
    }

    update() {
        let walkSpeed = 160;
        if (this.cursors?.right.isDown) {
            this.player?.setFlipX(false);

            if (this.cursors?.shift.isUp) {
                this.player?.setVelocityX(walkSpeed);
                this.player?.anims.play('walk', true);
            } else {
                this.player?.setVelocityX(walkSpeed * 2);
                this.player?.anims.play('run', true);
            }

        } else if (this.cursors?.left.isDown && this.cursors?.shift.isUp) {
            this.player?.setFlipX(true);
            this.player?.setVelocityX(-160);
            this.player?.anims.play('walk', true);
        } else {
            this.player?.setVelocityX(0);
            this.player?.anims.play('idle', true);
        }

        if (this.cursors?.space.isDown && this.player?.body.touching.down) {
            this.player?.setVelocityY(-300);
        }
    }

    private createPlayer() {
        // PlayerWalk
        this.player = this.physics.add.sprite(100, 450, 'player-walk');
        this.player.setScale(1.5);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Player animations
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });
    }
}

const config = {
    type: CANVAS,
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