import * as Phaser from 'phaser';

export interface InputButton {
    get isUp() : boolean;
}

class KeyboardInputButton implements InputButton {
    private key : Phaser.Input.Keyboard.Key;

    constructor(key: Phaser.Input.Keyboard.Key) {
        this.key = key;
    }

    get isUp(): boolean {
        return this.key.isUp;
    }
}

class GamepadAInputButton implements InputButton {
    private scene : Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    get isUp(): boolean {
        const pad = this.scene.input.gamepad.getPad(0);
        if (pad) {
            return !pad.A;
        }

        return true;
    }
}

export default class InputController {
    public enabled: boolean;

    private readonly aKey : Phaser.Input.Keyboard.Key;
    private readonly dKey : Phaser.Input.Keyboard.Key;
    private readonly leftKey : Phaser.Input.Keyboard.Key;
    private readonly rightKey : Phaser.Input.Keyboard.Key;
    private readonly upKey : Phaser.Input.Keyboard.Key;
    private readonly wKey : Phaser.Input.Keyboard.Key;
    private readonly scene : Phaser.Scene;
    private readonly wKeyInputButton : InputButton;
    private readonly upKeyInputButton : InputButton;
    private readonly gamepadAInputButton : InputButton;
    
    constructor(scene: Phaser.Scene) {
        this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.enabled = true;
        this.scene = scene;
        this.wKeyInputButton = new KeyboardInputButton(this.wKey);
        this.upKeyInputButton = new KeyboardInputButton(this.upKey);
        this.gamepadAInputButton = new GamepadAInputButton(scene);
    }

    get isLeftDown() : boolean {
        if (!this.enabled) {
            return false;
        }

        const pad = this.scene.input.gamepad.getPad(0);
        if (pad && pad.axes.length) {
            const axisH = pad.axes[0].getValue();
            if (axisH < -0.1) {
                return true;
            }
        }

        return this.leftKey.isDown || this.aKey.isDown;
    }

    get isRightDown() : boolean {
        if (!this.enabled) {
            return false;
        }

        const pad = this.scene.input.gamepad.getPad(0);
        if (pad && pad.axes.length) {
            const axisH = pad.axes[0].getValue();
            if (axisH > 0.1) {
                return true;
            }
        }

        return this.rightKey.isDown || this.dKey.isDown;
    }

    get isUpDown() : boolean {
        if (!this.enabled) {
            return false;
        }

        const pad = this.scene.input.gamepad.getPad(0);
        if (pad && pad.A) {
            return true;
        }

        return this.upKey.isDown || this.wKey.isDown;
    }

    get strength() : number {
        const pad = this.scene.input.gamepad.getPad(0);
        if (pad && pad.axes.length) {
            const axisH = pad.axes[0].getValue();
            if (Math.abs(axisH) > 0.1) {
                return Math.abs(axisH);
            }
        }

        return 1;
    }

    get upKeyPressed() : InputButton {
        const pad = this.scene.input.gamepad.getPad(0);
        if (pad && pad.A) {
            return this.gamepadAInputButton;
        }

        if (this.upKey.isDown) {
            return this.upKeyInputButton;
        }

        if (this.wKey.isDown) {
            return this.wKeyInputButton;
        }

        return undefined;
    }
}