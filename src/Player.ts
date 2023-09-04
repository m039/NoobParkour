import * as Phaser from 'phaser';

export enum PlayerAnimation {
    Idle = "Idle",
    Run = "Run"
}

export default class Player {
    container : Phaser.GameObjects.Container;

    readonly bodySize = { width: 13, height: 16 };

    body : Phaser.Physics.Arcade.Body;

    private sprite : Phaser.GameObjects.Sprite;    

    private currentAnimation? : PlayerAnimation;
    
    constructor(scene: Phaser.Scene) {
        this.container = scene.add.container(400, 400);
        this.sprite = scene.add.sprite(-1, -2, "noob");
        this.container.add(this.sprite);
        this.container.setSize(this.bodySize.width, this.bodySize.height);
        scene.physics.world.enableBody(this.container);
        this.body = this.container.body as Phaser.Physics.Arcade.Body;
        this.play(PlayerAnimation.Idle);
        this.flipX = false;
    }

    public play(playerAnimation: PlayerAnimation) {
        if (this.currentAnimation === playerAnimation) {
            return;
        }

        let repeat = false;

        switch (playerAnimation) {
            case PlayerAnimation.Run:
            case PlayerAnimation.Idle:
                repeat = true;
                break;
        }

        this.sprite.play({key: playerAnimation, repeat: (repeat? -1: 1)});
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
}