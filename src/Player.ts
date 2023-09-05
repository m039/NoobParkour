import * as Phaser from 'phaser';

enum PlayerAnimation {
    Idle = "Idle",
    Run = "Run",
    Jump = "Jump",
    Fall = "Fall",
    DoubleJump = "Double Jump"
}

export default class Player {
    container : Phaser.GameObjects.Container;

    readonly bodySize = { width: 7, height: 16 };

    body : Phaser.Physics.Arcade.Body;

    private sprite : Phaser.GameObjects.Sprite;    

    private currentAnimation? : PlayerAnimation;

    private inDoubleJump : boolean;
    
    constructor(scene: Phaser.Scene) {
        this.container = scene.add.container(400, 400);
        this.sprite = scene.add.sprite(-1, -2, "noob");
        this.container.add(this.sprite);
        this.container.setSize(this.bodySize.width, this.bodySize.height);
        scene.physics.world.enableBody(this.container);
        this.body = this.container.body as Phaser.Physics.Arcade.Body;
        this.play(PlayerAnimation.Idle);
        this.flipX = false;
        this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.inDoubleJump = false;
        });
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

    public update() {
        if (this.inDoubleJump) {
            this.play(PlayerAnimation.DoubleJump, false);
        } else if (this.body.velocity.y < 0) {
            this.play(PlayerAnimation.Jump);
        } else if (this.body.velocity.y > 0) {
            this.play(PlayerAnimation.Fall);
        } else if (Math.abs(this.body.velocity.x) > 0 && this.body.blocked.down) {
            this.play(PlayerAnimation.Run);
        } else if (this.body.blocked.down) {
            this.play(PlayerAnimation.Idle);
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
        this.body.setVelocityX(-100);
        this.flipX = true;
    }

    public moveRight() {
        this.body.setVelocityX(100);
        this.flipX = false;
    }

    public jump() {
        this.body.setVelocityY(-300);
    }

    public doubleJump() {
        this.body.setVelocityY(this.body.velocity.y - 400);
        this.inDoubleJump = true;
    }

    public stopJump() {
        if (this.body.velocity.y < 0) {
            this.body.setVelocityY(0);
        }
    }

    public stay() {
        this.body.setVelocityX(0);
    }
}