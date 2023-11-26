import { CANVAS, Game, Input, Physics, Scene, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private platforms: Physics.Arcade.StaticGroup | undefined;
    private playerWalk: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    private playerIdle: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
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
        this.load.spritesheet('player-idle', '/assets/Raider_1/Idle.png', {
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
        this.physics.add.collider(this.playerWalk!, this.platforms);
        this.physics.add.collider(this.playerIdle!, this.platforms);
        this.physics.world.bounds.setTo(0, 0, width * 50, height);

        // Camera 
        this.cameras.main.setBounds(0, 0, width * 50, height);
        this.cameras.main.startFollow(this.playerWalk!);
    }

    update() {
        if (this.cursors?.right.isDown && this.cursors?.shift.isUp) {
            this.walk("right");
        } else if (this.cursors?.left.isDown && this.cursors?.shift.isUp) {
            this.walk("left");
        }
        else {
            // Make walking sprite invisible
            this.playerWalk!.visible = false;
            // Make idle sprite visible
            this.playerIdle!.visible = true;
            // Make both sprites stop moving
            this.playerWalk?.setVelocityX(0);
            this.playerIdle?.setVelocityX(0);

            // Do idle animation
            this.playerIdle?.anims.play('idle', true);
        }
    }

    private createPlayer() {
        // PlayerWalk
        this.playerWalk = this.physics.add.sprite(100, 450, 'player-walk');
        this.playerWalk.setScale(1.5);
        this.playerWalk.setBounce(0.2);
        this.playerWalk.setCollideWorldBounds(true);
        // Player Idle
        this.playerIdle = this.physics.add.sprite(100, 450, 'player-idle');
        this.playerIdle.setScale(1.5);
        this.playerIdle.setBounce(0.2);
        this.playerIdle.setCollideWorldBounds(true);
        this.playerIdle.visible = false;
        // Player animation
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });
    }
    private walk(direction = "right") {

        if (direction === "right") {
            this.playerWalk?.setFlipX(false);
            this.playerIdle?.setFlipX(false);
            this.playerWalk?.setVelocityX(160);
            this.playerIdle?.setVelocityX(160);
        } else {
            this.playerWalk?.setFlipX(true);
            this.playerIdle?.setFlipX(true);
            this.playerWalk?.setVelocityX(-160);
            this.playerIdle?.setVelocityX(-160);
        }
        // Set walk sprite visible
        this.playerWalk!.visible = true;
        // Set idle sprite invisible
        this.playerIdle!.visible = false;
        // Set attributes on walk sprite
        this.playerWalk?.setBounce(0.2);
        // Set attributes on idle sprite
        this.playerIdle?.setBounce(0.2);
        // Do walking animation
        this.playerWalk?.anims.play('walk', true);
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