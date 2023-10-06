import * as Phaser from 'phaser';
import { SoundId } from './AudioManager';
import { GameManager } from '../Scenes/BaseScene';
import LevelScene from '../Scenes/LevelScene';
import SceneKeys from '../Consts/SceneKeys';
import AudioScene from '../Scenes/AudioScene';

enum PlayerAnimation {
    Idle = "Idle",
    Run = "Run",
    Jump = "Jump",
    Fall = "Fall",
    DoubleJump = "Double Jump",
    DeathInAir = "Death In Air",
    Fly = "Fly",
    WallSlide = "Wall Slide"
}

export enum PlayerEvent {
    DeathInAir = "DeathInAir"
}

export const MovementConsts = {
    JumpBufferTimeMs: 70,
    CoyoteTimeMs: 140,
    JumpCutOffMultiplier: 0.4,
    MaxFallSpeed: 300,
    HorizontalSpeed: 100,
    JumpSpeed: 250,
    LongJumpSpeed: 320,
    GravityUp: 500,
    GravityDown: 800,
    WallSlideFallSpeed: 50,
    WallSlideHorizontalSpeed: 150,
    WallSlideCooldownMs: 200
};

export default class Player implements GameManager {
    public container : Phaser.GameObjects.Container;

    public readonly bodySize = { width: 7, height: 16 };

    public body : Phaser.Physics.Arcade.Body;

    public emmiter : Phaser.Events.EventEmitter;

    public groundLayer : Phaser.Tilemaps.TilemapLayer;

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

    private wallSlideTimer : number = 0;

    private velocityX : number;
    
    constructor(levelScene: LevelScene) {
        this.levelScene = levelScene;
    }

    preload(): void {
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

    public get isTouchingLeft() {
        if (this.groundLayer === undefined) {
            return false;
        }

        return this.groundLayer.getTileAtWorldXY(
            this.container.x - this.bodySize.width / 2 - 1,
            this.container.y
        ) !== null;
    }

    public get isTouchingRight() {
        if (this.groundLayer === undefined) {
            return false;
        }

        return this.groundLayer.getTileAtWorldXY(
            this.container.x + this.bodySize.width / 2 + 1,
            this.container.y
        ) !== null;
    }

    update(time: number, delta: number) {
        if (this.inDieInAir) {
            this.play(PlayerAnimation.DeathInAir, false);
        } else if ((this.isTouchingLeft || this.isTouchingRight) && 
                    !this.body.blocked.down) {
            this.play(PlayerAnimation.WallSlide);
        } else if (this.inDoubleJump) {
            this.play(PlayerAnimation.DoubleJump, false);
        } else if (this.inFly) {
            this.play(PlayerAnimation.Fly);
        } else if (this.body.velocity.y < 0) {
            this.play(PlayerAnimation.Jump);
        } else if (this.body.velocity.y > 0) {
            this.play(PlayerAnimation.Fall);
        } else if (Math.abs(this.velocityX) > 0 && this.body.blocked.down) {
            this.play(PlayerAnimation.Run);
        } else if (this.body.blocked.down || this.inIdle) {
            this.play(PlayerAnimation.Idle);
        }

        // Show dust particles when the direction of movement is changed.
        this.passedDistance += this.velocityX * delta / 1000;

        if (this.velocityX > 0 && this.passedDistance < 0 ||
            this.velocityX < 0 && this.passedDistance > 0 || 
            this.velocityX === 0 && Math.abs(this.passedDistance) > 0) {
            
            // Only when the player is standing on the ground.
            if (this.body.blocked.down) {
                const passedDistanceOld = this.passedDistance;
                setTimeout(() => {
                    if (this.velocityX > 0 && passedDistanceOld < 0 ||
                        this.velocityX < 0 && passedDistanceOld > 0) {
                        this.showDust();
                    }
                }, 100);
            }

            this.passedDistance = 0;
        }

        // Limit vertical velocity.
        if (this.body.velocity.y > MovementConsts.MaxFallSpeed) {
            this.body.velocity.y = MovementConsts.MaxFallSpeed;
        }

        // Set gravity.
        if (this.body.velocity.y > 0) {
            this.body.gravity.y = MovementConsts.GravityDown;
        } else {
            this.body.gravity.y = MovementConsts.GravityUp;
        }

        // Wall slide.

        if ((this.isTouchingLeft ||
             this.isTouchingRight) && 
            !this.body.blocked.down) {
            this.body.velocity.y = Math.min(this.body.velocity.y, MovementConsts.WallSlideFallSpeed);
        }

        if (this.wallSlideTimer > 0) {
            this.wallSlideTimer -= delta;
        }

        // Update velocity.
        this.body.velocity.x = this.velocityX;
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

    public moveLeft(strength: number) {
        if (this.isDead) {
            return;
        }

        if (this.wallSlideTimer <= 0) {
            this.setVelocityX(-MovementConsts.HorizontalSpeed * strength);
            this.flipX = true;
        }
    }

    public moveRight(strength: number) {
        if (this.isDead) {
            return;
        }

        if (this.wallSlideTimer <= 0) {
            this.setVelocityX(MovementConsts.HorizontalSpeed * strength);
            this.flipX = false;
        }
    }

    public jump() {
        if (this.isDead) {
            return;
        }

        this.body.velocity.y = -MovementConsts.JumpSpeed;
        this.showDust();
    }

    public longJump() {
        if (this.isDead) {
            return;
        }

        this.body.velocity.y = -MovementConsts.LongJumpSpeed;
        this.showDust();
    }

    public doubleJump() {
        if (this.isDead) {
            return;
        }

        this.body.velocity.y = -MovementConsts.JumpSpeed;
        this.inDoubleJump = true;
        this.showDust();

        const audioScene = this.levelScene.scene.get(SceneKeys.Audio) as AudioScene;
        audioScene.audioManager.playSound(SoundId.Jump);
    }

    public wallJump(direction: number) {
        if (this.isDead) {
            return;
        }

        this.body.velocity.y = -MovementConsts.JumpSpeed;
        this.setVelocityX(direction * MovementConsts.WallSlideHorizontalSpeed);
        this.showDust();
        this.wallSlideTimer = MovementConsts.WallSlideCooldownMs;
        this.flipX = direction == -1;
        this.inDoubleJump = false;
    }

    public stopJump() {
        if (this.isDead) {
            return;
        }

        if (this.body.velocity.y < 0) {
            this.body.velocity.y = this.body.velocity.y * MovementConsts.JumpCutOffMultiplier;
        }
    }

    public stay() {
        if (this.isDead) {
            return;
        }

        if (this.wallSlideTimer <= 0) {
            this.setVelocityX(0);
        }
    }

    public dieInAir() {
        if (this.isDead) {
            return;
        }

        this.inDieInAir = true;
        this.isDead = true;
        this.body.setVelocity(0, 0);
        this.setVelocityX(0);
        this.body.setAllowGravity(false);

        const audioScene = this.levelScene.scene.get(SceneKeys.Audio) as AudioScene;
        audioScene.audioManager.playSound(SoundId.Loose);
    }

    public restartLevel(tint: boolean) {
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
        this.setVelocityX(0);
        this.body.setAllowGravity(false);
    }

    private setVelocityX(x:number) {
        this.velocityX = x;
    }

    public fly() {
        this.inFly = true;
    }

    private showDust() {
        var p = this.getPosition();
        this.dustEmmiter.emitParticleAt(p.x, p.y + 3, Math.floor(Math.random() * 3) + 4);
    }
}