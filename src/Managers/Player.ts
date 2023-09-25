import * as Phaser from 'phaser';
import { SoundId } from './AudioManager';
import { GameManager } from '../Scenes/BaseScene';
import LevelScene from '../Scenes/LevelScene';

enum PlayerAnimation {
    Idle = "Idle",
    Run = "Run",
    Jump = "Jump",
    Fall = "Fall",
    DoubleJump = "Double Jump",
    DeathInAir = "Death In Air",
    Fly = "Fly"
}

export enum PlayerEvent {
    DeathInAir = "DeathInAir"
}

export default class Player implements GameManager {
    container : Phaser.GameObjects.Container;

    readonly bodySize = { width: 7, height: 16 };

    body : Phaser.Physics.Arcade.Body;

    emmiter : Phaser.Events.EventEmitter;

    private sprite : Phaser.GameObjects.Sprite;    

    private currentAnimation? : PlayerAnimation;

    private inDoubleJump : boolean;

    private inDieInAir : boolean;

    private inFly : boolean;

    private inIdle : boolean;

    private isDead : boolean;

    private levelScene : LevelScene;

    private dustEmmiter : Phaser.GameObjects.Particles.ParticleEmitter;

    private passedDistance : number;
    
    constructor(levelScene: LevelScene) {
        this.levelScene = levelScene;
    }

    preload(): void {
        this.levelScene.load.aseprite("noob", "assets/animations/NoobMain.png", "assets/animations/NoobMain.json");
    }

    create(): void {
        if (!this.levelScene.anims.exists("Idle")) {
            this.levelScene.anims.createFromAseprite("noob");
        }

        this.emmiter = new Phaser.Events.EventEmitter();
        this.container = this.levelScene.add.container(400, 400);
        this.sprite = this.levelScene.add.sprite(-1, -2, "noob");
        this.container.add(this.sprite);
        this.container.setSize(this.bodySize.width, this.bodySize.height);
        this.container.depth = 1;
        this.levelScene.physics.world.enableBody(this.container);
        this.body = this.container.body as Phaser.Physics.Arcade.Body;
        this.play(PlayerAnimation.Idle);
        this.flipX = false;
        this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.inDoubleJump = false;
            
            if (this.inDieInAir) {
                this.emmiter.emit(PlayerEvent.DeathInAir);
                this.inDieInAir = false;
            }
        });
        this.dustEmmiter = this.levelScene.add.particles(0, 0, "pixel", {
            lifespan: 1000,
            speed: {min: 10, max: 20},
            scale: {start: 5, end: 0},
            rotate: {start: 0, end: 360},
            gravityY: 50,
            emitting: false
        });
        this.dustEmmiter.depth = 1;
        this.passedDistance = 0;
    }

    private play(playerAnimation: PlayerAnimation, repeat?:boolean) {
        if (this.currentAnimation === playerAnimation) {
            return;
        }

        if (repeat === undefined) {
            repeat = true;
        }

        this.sprite.play({key: playerAnimation, repeat: (repeat? -1: 0)});
        this.currentAnimation = playerAnimation;
    }

    public set flipX(value: boolean) {
        this.sprite.flipX = value;
        if (value) {
            this.sprite.x = 1;
        } else {
            this.sprite.x = -1;
        }
    }

    update(time: number, delta: number) {
        if (this.inDieInAir) {
            this.play(PlayerAnimation.DeathInAir, false);
        } else if (this.inDoubleJump) {
            this.play(PlayerAnimation.DoubleJump, false);
        } else if (this.inFly) {
            this.play(PlayerAnimation.Fly);
        } else if (this.body.velocity.y < 0) {
            this.play(PlayerAnimation.Jump);
        } else if (this.body.velocity.y > 0) {
            this.play(PlayerAnimation.Fall);
        } else if (Math.abs(this.body.velocity.x) > 0 && this.body.blocked.down) {
            this.play(PlayerAnimation.Run);
        } else if (this.body.blocked.down || this.inIdle) {
            this.play(PlayerAnimation.Idle);
        }

        // Show dust particles when the direction of movement is changed.
        this.passedDistance += this.body.velocity.x * delta / 1000;

        if (this.body.velocity.x > 0 && this.passedDistance < 0 ||
            this.body.velocity.x < 0 && this.passedDistance > 0 || 
            this.body.velocity.x === 0 && Math.abs(this.passedDistance) > 0) {
            
            // Only when the player is standing on the ground.
            if (this.body.blocked.down) {
                const passedDistanceOld = this.passedDistance;
                setTimeout(() => {
                    if (this.body.velocity.x > 0 && passedDistanceOld < 0 ||
                        this.body.velocity.x < 0 && passedDistanceOld > 0) {
                        this.showDust();
                    }
                }, 100);
            }

            this.passedDistance = 0;
        }
    }

    public setPosition(x?:number, y?:number) {
        if (x === undefined) {
            x = 0;
        }

        if (y === undefined) {
            y = 0;
        }

        this.container.setPosition(x, y);
    }

    public getPosition() : Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.container.x, this.container.y);
    }

    public moveLeft() {
        if (this.isDead) {
            return;
        }

        this.body.setVelocityX(-100);
        this.flipX = true;
    }

    public moveRight() {
        if (this.isDead) {
            return;
        }

        this.body.setVelocityX(100);
        this.flipX = false;
    }

    public jump() {
        if (this.isDead) {
            return;
        }

        this.body.setVelocityY(-300);
        this.showDust();
    }

    public doubleJump() {
        if (this.isDead) {
            return;
        }

        this.body.setVelocityY(this.body.velocity.y - 400);
        this.inDoubleJump = true;
        this.showDust();
        this.levelScene.audioManager.playSound(SoundId.Jump);
    }

    public stopJump() {
        if (this.isDead) {
            return;
        }

        if (this.body.velocity.y < 0) {
            this.body.setVelocityY(0);
        }
    }

    public stay() {
        if (this.isDead) {
            return;
        }

        this.body.setVelocityX(0);
    }

    public dieInAir() {
        if (this.isDead) {
            return;
        }

        this.inDieInAir = true;
        this.isDead = true;
        this.body.setVelocity(0, 0);
        this.body.setAllowGravity(false);
        this.levelScene.cameras.main.roundPixels = true;
        this.levelScene.audioManager.playSound(SoundId.Loose);
    }

    public restartLevel(tint: boolean) {
        this.levelScene.cameras.main.roundPixels = false;
        this.container.scale = 0;
        const self = this;

        this.levelScene.tweens.add({
            targets: [this.container],
            scale: 1,
            yoyo: false,
            duration: 400,
            repeat: 0,
            ease: Phaser.Math.Easing.Cubic.Out,
            onComplete: function () {
                self.isDead = false;
                self.inDieInAir = false;
                self.inDoubleJump = false;
                self.body.setAllowGravity(true);
                self.inIdle = false;
            }
        });

        if (tint) {
            setTimeout(() => {
                this.sprite.setTint(0xff83ff);
                setTimeout(() => {
                    this.sprite.clearTint();
                    setTimeout(() => {
                        this.sprite.setTint(0xff83ff);
                        setTimeout(() => {
                            this.sprite.clearTint();
                        }, 100);
                    }, 200)
                }, 100);
            }, 200);
        }

        this.inIdle = true;
        this.isDead = true;
        this.flipX = false;
        this.inFly = false;
        this.body.setVelocity(0, 0);
        this.body.setAllowGravity(false);
    }

    public fly() {
        this.inFly = true;
    }

    private showDust() {
        var p = this.getPosition();
        this.dustEmmiter.emitParticleAt(p.x, p.y + 3, Math.floor(Math.random() * 3) + 4);
    }
}