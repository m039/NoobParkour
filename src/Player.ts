import * as Phaser from 'phaser';

export default class Player {
    sprite : Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene) {
        this.sprite = scene.add.sprite(400, 400, "noob").play({key:"Idle", repeat: -1});
    }

    public setPosition(x?:number, y?:number) {
        if (x === undefined) {
            x = 0;
        }

        if (y == undefined) {
            y = 0;
        }

        this.sprite.setPosition(x, y);
    }

    public getPosition() : Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    }
}