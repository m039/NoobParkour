import * as Phaser from 'phaser';

export default class InputController {
    public enabled: boolean;

    private readonly aKey : Phaser.Input.Keyboard.Key;
    private readonly dKey : Phaser.Input.Keyboard.Key;
    private readonly leftKey : Phaser.Input.Keyboard.Key;
    private readonly rightKey : Phaser.Input.Keyboard.Key;
    private readonly upKey : Phaser.Input.Keyboard.Key;
    private readonly wKey : Phaser.Input.Keyboard.Key;
    
    constructor(scene: Phaser.Scene) {
        this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.enabled = true;
    }

    get isLeftDown() : boolean {
        return this.enabled && (this.leftKey.isDown || this.aKey.isDown);
    }

    get isRightDown() : boolean {
        return this.enabled && (this.rightKey.isDown || this.dKey.isDown);
    }

    get isUpDown() : boolean {
        return this.enabled && (this.upKey.isDown || this.wKey.isDown);
    }

    get upKeyPressed() : Phaser.Input.Keyboard.Key {
        if (this.upKey.isDown) {
            return this.upKey;
        }

        if (this.wKey.isDown) {
            return this.wKey;
        }

        return undefined;
    }
}