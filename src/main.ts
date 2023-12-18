import { Animations, Game, GameObjects, Input, Physics, Scene, Sound, Types, WEBGL } from 'phaser';
import './style.css';

const canvas = document.querySelector('canvas#game') as HTMLCanvasElement;
const worldGravity = 300;

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
    private gunShoot: Sound.WebAudioSound | undefined;
    private greenSlimes: Physics.Arcade.Group | undefined;
    private redBullets: Physics.Arcade.Group | undefined;
    private shootKey: Input.Keyboard.Key | undefined;
    private collisionHappening = false;
    private gameOver = false;
    private isShooting = false;
    private slimeSpeed = 100;
    private slimeDirectionMap: Map<Phaser.Physics.Arcade.Sprite, { nextDirectionChange: number, targetAngle: number; }> = new Map();
    private playerDirection: Direction = Direction.Right;


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
        this.createBullets();

        // Movement keys
        this.cursors = this.input.keyboard?.addKeys({
            'up': Input.Keyboard.KeyCodes.W,
            'left': Input.Keyboard.KeyCodes.A,
            'down': Input.Keyboard.KeyCodes.S,
            'right': Input.Keyboard.KeyCodes.D,
            'space': Input.Keyboard.KeyCodes.SPACE,
            'shift': Input.Keyboard.KeyCodes.SHIFT,
        }) as Types.Input.Keyboard.CursorKeys;

        this.shootKey = this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.J);
        this.shootKey?.addListener('down', this.shootBullet, this);

        // Music/Sounds
        this.level1BgMusic = this.sound.add('level1BgMusic', { loop: true, volume: 0.09 }) as Sound.WebAudioSound;
        this.level1BgMusic.play();
        this.footsteps = this.sound.add('footsteps', { loop: true }) as Sound.WebAudioSound;
        this.runsteps = this.sound.add('footsteps', { rate: 2, loop: true }) as Sound.WebAudioSound;
        this.gunShoot = this.sound.add('gunshot', { loop: false }) as Sound.WebAudioSound;

        // Physics
        this.physics.add.collider(this.player!, this.platforms!);
        this.physics.add.collider(this.greenSlimes!, this.platforms!);
        this.physics.add.overlap(this.player!, this.greenSlimes!, this.slimePlayerCollision, undefined, this);
        this.physics.add.collider(this.redBullets!, this.greenSlimes!, this.bulletSlimeCollision, undefined, this);
        this.physics.world.bounds.setTo(0, 0, this.worldWidth, height);

        // Camera 
        this.cameras.main.setBounds(0, 0, this.worldWidth, height);
        this.cameras.main.startFollow(this.player!);
    }

    private bulletSlimeCollision(bullet: any, slime: any) {
        bullet.setActive(false);
        bullet.setVisible(false);
        slime.setTint(0xff0000);
        slime.setVelocity(0, -3000);
        slime.setActive(false);
        this.slimeSpeed += 100;
    }

    private shootBullet() {
        if (this.gameOver) {
            return;
        }
        // const bullet: Physics.Arcade.Sprite = this.redBullets?.get(this.player?.x, this.player?.y! + 50);
        let bulletUp: Physics.Arcade.Sprite = this.redBullets?.get();
        let bullet: Physics.Arcade.Sprite = this.redBullets?.get();
        let bulletDown: Physics.Arcade.Sprite = this.redBullets?.get();
        const bulletVelocity = 2000;
        if (bullet) {
            bullet.setScale(4, 2);
            bullet.setPosition(this.player?.x, this.player?.y! + 50);
            bulletUp.setScale(4, 2);
            bulletUp.setPosition(this.player?.x, this.player?.y! + 50);
            bulletDown.setScale(4, 2);
            bulletDown.setPosition(this.player?.x, this.player?.y! + 50);
            if (this.playerDirection == Direction.Right) {
                bullet.setVelocityX(bulletVelocity);
                bulletUp.setVelocityX(bulletVelocity);
                bulletDown.setVelocityX(bulletVelocity);
            } else {
                bullet.setVelocityX(-bulletVelocity);
                bulletUp.setVelocityX(-bulletVelocity);
                bulletDown.setVelocityX(-bulletVelocity);
            }
            bulletUp.setVelocityY(-bulletVelocity / 2);
            bulletDown.setVelocityY(bulletVelocity / 2);
            bullet.setActive(true);
            bullet.setVisible(true);
            bulletUp.setActive(true);
            bulletUp.setVisible(true);
            bulletDown.setActive(true);
            bulletDown.setVisible(true);

            this.stopPlayer();
            // Set isShooting flag so update method will stop playing other animations
            this.isShooting = true;
            this.gunShoot?.play();
            // Play shoot animation, and once its played through unset isShooting flag
            this.player?.anims.play('shoot');
            this.player?.once(Animations.Events.ANIMATION_COMPLETE, () => {
                this.isShooting = false;
            }, this);

            // Destroy each bullet 3/4 seconds after it's creation
            this.time.delayedCall(750, () => {
                bullet.destroy();
                bulletUp.destroy();
                bulletDown.destroy();
            }, undefined, this);
        }
    }

    private activateBullet() {
        let bullet: Physics.Arcade.Sprite = this.redBullets?.get();
        bullet.setScale(4, 2);
        bullet.setPosition(this.player?.x, this.player?.y! + 50);
    }

    private stopPlayer() {
        // Let player keep moving if in air, otherwise stop velocity
        if (this.player?.body.touching.down) {
            this.player?.setVelocity(0);
        }
        // Stop walk run sounds
        this.footsteps?.stop();
        this.runsteps?.stop();
    }

    private slimePlayerCollision() {
        this.player?.setTint(0xff0000);
        this.collisionHappening = true;
    }

    update() {
        if (!this.collisionHappening) {
            if (!this.isShooting) {
                this.handleMovementKeys();
            }
            this.greenSlimeMove();
        } else if (this.collisionHappening && !this.gameOver) {
            this.gameOver = true;
            this.player?.anims.play('die', true);
            this.player?.setVelocity(0, 800);
            this.footsteps?.stop();
            this.runsteps?.stop();
        }
    }


    private handleMovementKeys() {
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

    private greenSlimeAIMoveSimple() {
        for (const greenSlime of this.greenSlimes!.getChildren()) {
            if (!greenSlime.active) {
                continue;
            }
            const typedSlime = greenSlime as Physics.Arcade.Sprite;
            let angle = Phaser.Math.Angle.Between(typedSlime.x, typedSlime.y, this.player!.x, this.player!.y);
            const randomness = 0.2;
            angle += Phaser.Math.FloatBetween(-randomness, randomness);
            typedSlime.setVelocity(Math.cos(angle) * this.slimeSpeed, Math.sin(angle) * this.slimeSpeed);
        }
    }

    private greenSlimeMove() {
        const counter = this.game.getFrame() % 100;
        // Alternate between simple movement where slime directly tracks player and complex movement 
        // where slime moves randomly. 33% simple 66% complex
        if (counter < 33) {
            this.greenSlimeAIMoveSimple();
        } else {
            this.greenSlimeAIMove();
        }
    }


    private greenSlimeAIMove() {
        const changeInterval = 500; // Direction change every 500 ms
        const maxAngleDeviation = Math.PI / 2; // Max deviation of pi/2 radians or 90 degrees
        for (const greenSlime of this.greenSlimes!.getChildren()) {
            if (!greenSlime.active) {
                continue;
            }
            const typedSlime = greenSlime as Physics.Arcade.Sprite;

            let slimeData = this.slimeDirectionMap.get(typedSlime);

            if (!slimeData || slimeData.nextDirectionChange < this.time.now) {
                slimeData = {
                    nextDirectionChange: this.time.now + changeInterval,
                    targetAngle: Phaser.Math.Angle.Between(typedSlime.x, typedSlime.y, this.player!.x, this.player!.y) + Phaser.Math.FloatBetween(-maxAngleDeviation, maxAngleDeviation)
                };
                this.slimeDirectionMap.set(typedSlime, slimeData);
            }

            const currentAngle = Math.atan2(typedSlime.body?.velocity.y!, typedSlime.body?.velocity.x!);
            let angle = Phaser.Math.Angle.RotateTo(currentAngle, slimeData.targetAngle, 0.02); // adjust this for turn speed

            typedSlime.setVelocity(Math.cos(angle) * this.slimeSpeed, Math.sin(angle) * this.slimeSpeed);
        }
    }


    private playerMove(direction: Direction) {
        let walkSpeed = 200;
        // Set playerDirection so we know which direction to shoot bullets
        this.playerDirection = direction;
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

    private createBullets() {
        this.redBullets = this.physics.add.group({
            defaultKey: 'red-bullet',
            // maxSize: 10, // means max of 10 bullets
        });
    }

    private createGreenSlime() {

        // Create green slime group specifying number of and position for each
        this.greenSlimes = this.physics.add.group({
            key: 'green-slime-attack3',
            repeat: 5,
            gravityY: -worldGravity,
            setXY: { x: 10, y: 0, stepX: 500, stepY: 0 },
        });


        // Make hitboxes smaller
        this.greenSlimes?.children.iterateLocal('setBodySize', 50, 50);
        this.greenSlimes?.children.iterateLocal('setOffset', 40, 85);
    }

    private createPlayer() {
        let playerHeightOffset = 60;
        let playerWidthOffset = 100;
        this.player = this.physics.add.sprite(100, 450, 'player-walk');
        this.player.setScale(2.5);
        this.player.setCollideWorldBounds(true);
        this.player?.setBodySize(this.player.width - playerWidthOffset, this.player.height - playerHeightOffset);
        this.player?.setOffset(playerWidthOffset / 2, playerHeightOffset);


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
        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('player-dead', { start: 0, end: 3 }),
            frameRate: 20
        });
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('player-shoot', { start: 0, end: 11 }),
            frameRate: 30,
            repeat: 0
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
        this.load.image('red-bullet', '/assets/Bullets/redBullet.png');
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
        this.load.spritesheet('player-dead', '/assets/Raider_1/Dead.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('player-shoot', '/assets/Raider_1/Shot.png', {
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
        this.load.audio('gunshot', '/assets/Sound/Gunshot.mp3');
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
            gravity: { y: worldGravity },
            debug: false
        }
    },
    scene: [
        GameScene
    ]
};

new Game(config);