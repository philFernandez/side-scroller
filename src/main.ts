import { CANVAS, Game, GameObjects, Input, Physics, Scene, Types } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

class GameScene extends Scene {
    private sky: GameObjects.TileSprite | undefined;
    private road: GameObjects.TileSprite | undefined;
    private platforms: Physics.Arcade.StaticGroup | undefined;
    private player: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    private cursors: Types.Input.Keyboard.CursorKeys | undefined;
    private worldWidth: number | undefined;

    constructor() {
        super('scene-game');
    }

    preload() {
        this.load.image('sky', '/assets/Level1/sky.png');
        this.load.image('ground', '/assets/platform.png');
        this.load.image('road', '/assets/Level1/road.png');
        this.load.image('housesBG', '/assets/Level1/houses4.png');
        this.load.image('houses3', '/assets/Level1/houses3.png');
        this.load.image('houses2', '/assets/Level1/houses2.png');
        this.load.image('houses1', '/assets/Level1/houses1.png');
        this.load.image('moon', '/assets/Level1/moon.png');

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
        this.worldWidth = width * 5;
        // Sky
        this.add.image(width / 2, height / 2, 'sky').setScrollFactor(0);
        // Moon
        this.add.image(width / 2, height / 2, 'moon').setScrollFactor(0);


        // House shadows in background
        let housesBG = this.add.tileSprite(0, 0, this.worldWidth, 1080, "housesBG");
        housesBG.setOrigin(0, 0);
        housesBG.setScrollFactor(0.1);
        // Houses 3
        let houses3 = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'houses3');
        houses3.setOrigin(0, 0);
        houses3.setScrollFactor(0.3);
        // Houses 2
        let houses2 = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'houses2');
        houses2.setOrigin(0, 0);
        houses2.setScrollFactor(0.5);
        // Houses 1
        let houses1 = this.add.tileSprite(0, 0, this.worldWidth, 1080, 'houses1');
        houses1.setOrigin(0, 0);
        houses1.setScrollFactor(0.7);


        // Road
        let road = this.add.tileSprite(0, height / 2, this.worldWidth, 1080, "road");
        road.setOrigin(0, 0.5);



        this.platforms = this.physics.add.staticGroup();
        // Ground Platform

        let platform = this.platforms.create(0, height - (height / 40), undefined);
        platform.setVisible(false);
        platform.setBodySize(this.worldWidth * 2, height / 20, true);


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
        this.physics.add.collider(this.player!, this.platforms!);
        this.physics.world.bounds.setTo(0, 0, this.worldWidth, height);

        // Camera 
        this.cameras.main.setBounds(0, 0, this.worldWidth, height);
        this.cameras.main.startFollow(this.player!);
    }

    update() {
        let walkSpeed = 160;
        if (this.cursors?.right.isDown) { // move right
            // Dont flip sprites because they face right by default
            this.player?.setFlipX(false);
            // Walk if shift is up
            if (this.cursors?.shift.isUp) {
                this.player?.setVelocityX(walkSpeed);
                this.player?.anims.play('walk', true);
            } else { // else run
                this.player?.setVelocityX(walkSpeed * 2);
                this.player?.anims.play('run', true);
            }

        } else if (this.cursors?.left.isDown) { // move left
            // Flip sprites to move left
            this.player?.setFlipX(true);
            // Walk
            if (this.cursors?.shift.isUp) {
                this.player?.setVelocityX(-walkSpeed);
                this.player?.anims.play('walk', true);
            } else { // Run
                this.player?.setVelocityX(-walkSpeed * 2);
                this.player?.anims.play('run', true);
            }
        } else { // player is idle
            this.player?.setVelocityX(0);
            this.player?.anims.play('idle', true);
        }
        // Jump
        if (this.cursors?.space.isDown && this.player?.body.touching.down) {
            this.player?.setVelocityY(-300);
        }
    }

    private createPlayer() {
        // PlayerWalk
        // this.player = this.physics.add.sprite(this.worldWidth! - 100, 450, 'player-walk');
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