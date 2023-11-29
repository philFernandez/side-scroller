import { CANVAS, Game, GameObjects, Input, Physics, Scene, Sound, Types } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;

enum Direction {
    Right,
    Left
}

class GameScene extends Scene {
    private sky: GameObjects.TileSprite | undefined;
    private road: GameObjects.TileSprite | undefined;
    private platforms: Physics.Arcade.StaticGroup | undefined;
    private player: Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    private cursors: Types.Input.Keyboard.CursorKeys | undefined;
    private worldWidth: number | undefined;
    private level1BgMusic: Sound.WebAudioSound | undefined;
    private footsteps: Sound.WebAudioSound | undefined;
    private runsteps: Sound.WebAudioSound | undefined;
    private greenSlimes: Physics.Arcade.Group | undefined;

    constructor() {
        super('scene-game');
    }

    preload() {
        this.loadImages();
        this.loadSprites();
        this.loadAudio();
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
        this.createGreenSlime();

        // Movement keys
        this.cursors = this.input.keyboard?.addKeys({
            'up': Input.Keyboard.KeyCodes.W,
            'left': Input.Keyboard.KeyCodes.A,
            'down': Input.Keyboard.KeyCodes.S,
            'right': Input.Keyboard.KeyCodes.D,
            'space': Input.Keyboard.KeyCodes.SPACE,
            'shift': Input.Keyboard.KeyCodes.SHIFT,
        }) as Types.Input.Keyboard.CursorKeys;

        // Music/Sounds
        this.level1BgMusic = this.sound.add('level1BgMusic', { loop: true, volume: 0.01 }) as Sound.WebAudioSound;
        this.level1BgMusic.play();
        this.footsteps = this.sound.add('footsteps', { loop: true }) as Sound.WebAudioSound;
        this.runsteps = this.sound.add('footsteps', { rate: 2, loop: true }) as Sound.WebAudioSound;

        // Physics
        this.physics.add.collider(this.player!, this.platforms!);
        this.physics.add.collider(this.greenSlimes!, this.platforms!);
        this.physics.world.bounds.setTo(0, 0, this.worldWidth, height);

        // Camera 
        this.cameras.main.setBounds(0, 0, this.worldWidth, height);
        this.cameras.main.startFollow(this.player!);
    }

    update() {
        if (this.cursors?.right.isDown) {
            this.playerMove(Direction.Right);
        } else if (this.cursors?.left.isDown) {
            this.playerMove(Direction.Left);
        } else { // player is idle
            if (this.footsteps?.isPlaying) {
                this.footsteps?.stop();
            }
            if (this.runsteps?.isPlaying) {
                this.runsteps?.stop();
            }
            this.player?.setVelocityX(0);
            this.player?.anims.play('idle', true);
        }
        // Jump
        if (this.cursors?.space.isDown && this.player?.body.touching.down) {

            if (this.cursors?.shift.isDown) {
                this.player?.setVelocityY(-300);
            } else {
                this.player?.setVelocity(-225);
            }

            if (this.footsteps?.isPlaying) {
                this.footsteps?.stop();
            }
            if (this.runsteps?.isPlaying) {
                this.runsteps?.stop();
            }
        }
    }

    private playerMove(direction: Direction) {
        let walkSpeed = 200;
        this.player?.setFlipX(direction != Direction.Right);
        if (this.cursors?.shift.isUp) { // WALK
            // Since we're walking turn off the running footsteps if they're on
            if (this.runsteps?.isPlaying) {
                this.runsteps?.stop();
            }
            // Play walking footsteps if they're not already
            if (!this.footsteps?.isPlaying && this.player?.body.touching.down) {
                this.footsteps?.play();
            }

            this.player?.setVelocityX(direction == Direction.Right ? walkSpeed : -walkSpeed);

            if (this.player?.body.touching.down) {
                // If player is on ground to walk anim
                this.player?.anims.play('walk', true);
            } else {
                // Else do jump 
                if (this.player?.anims.isPlaying) {
                    this.player?.anims.play('jump', true);
                }
            }
        } else { // RUN
            // We are running, so stop playing walking footsteps
            if (this.footsteps?.isPlaying) {
                this.footsteps?.stop();
            }
            // Play running footsteps if they're not already
            if (!this.runsteps?.isPlaying && this.player?.body.touching.down) {
                this.runsteps?.play();
            }
            // Move player
            this.player?.setVelocityX(direction == Direction.Right ? walkSpeed * 2 : walkSpeed * -2);

            if (this.player?.body.touching.down) {
                // If player is on ground do run anim
                this.player?.anims.play('run', true);
            } else {
                // Else do jump 
                if (this.player?.anims.isPlaying) {
                    this.player?.anims.play('jump', true);
                }
            }
        }
    }

    private createGreenSlime() {
        this.greenSlimes = this.physics.add.group({
            key: 'green-slime-attack3',
            repeat: 5,
            setXY: { x: 10, y: 0, stepX: 500, stepY: 0 }
        });
    }

    private createPlayer() {
        // PlayerWalk
        // this.player = this.physics.add.sprite(this.worldWidth! - 100, 450, 'player-walk');
        this.player = this.physics.add.sprite(100, 450, 'player-walk');
        this.player.setScale(2.5);
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
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 8 }),
            frameRate: 20
        });
    }

    private loadImages() {
        this.load.image('sky', '/assets/Level1/sky.png');
        this.load.image('ground', '/assets/platform.png');
        this.load.image('road', '/assets/Level1/road.png');
        this.load.image('housesBG', '/assets/Level1/houses4.png');
        this.load.image('houses3', '/assets/Level1/houses3.png');
        this.load.image('houses2', '/assets/Level1/houses2.png');
        this.load.image('houses1', '/assets/Level1/houses1.png');
        this.load.image('moon', '/assets/Level1/moon.png');
    }

    private loadSprites() {
        // Player
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
        this.load.spritesheet('player-jump', '/assets/Raider_1/Jump.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        // Green-Slime
        this.load.spritesheet('green-slime-attack3', '/assets/Green_Slime/Attack_3.png', {
            frameWidth: 128,
            frameHeight: 128
        });
    }

    private loadAudio() {
        this.load.audio('level1BgMusic', '/assets/Sound/bg-Stylz.mp3');
        this.load.audio('footsteps', '/assets/Sound/walking.wav');
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