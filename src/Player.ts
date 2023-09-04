import * as Phaser from 'phaser';

export default class Player {
    container : Phaser.GameObjects.Container;
    private sprite : Phaser.GameObjects.Sprite;
    
    constructor(scene: Phaser.Scene) {
        this.container = scene.add.container(400, 400);
        this.sprite = scene.add.sprite(-1, -2, "noob").play({key:"Idle", repeat: -1});
        this.container.add(this.sprite);
        this.container.setSize(13, 16);
        scene.physics.add.existing(this.container);
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