import * as Phaser from 'phaser';

export default class InputController {
    private aKey : Phaser.Input.Keyboard.Key;
    private dKey : Phaser.Input.Keyboard.Key;
    private leftKey : Phaser.Input.Keyboard.Key;
    private rightKey : Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene) {
        this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    isLeftDown() : boolean {
        return this.leftKey.isDown || this.aKey.isDown;
    }

    isRightDown() : boolean {
        return this.rightKey.isDown || this.dKey.isDown;
    }
}