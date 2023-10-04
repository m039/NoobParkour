import * as Phaser from 'phaser';
import { GameManager } from '../Scenes/BaseScene';
import TextureKeys from '../Consts/TextureKeys';
import { GameHeight, GameWidth } from '../Consts/Consts';
import { InstantGamesBridge } from 'instant-games-bridge';

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

class OnScreenInputButton implements InputButton {
    private scene : Phaser.Scene;
    private isUpState : boolean;

    constructor(
        scene : Phaser.Scene, 
        x : number, 
        y : number, 
        defaultTexture : TextureKeys,
        hoveredTexture : TextureKeys
    ) {
        this.scene = scene;
        this.isUpState = true;

        const button = this.scene.add.image(x, y, defaultTexture);
        button.setOrigin(0.5, 1);
        button.setInteractive();
        button.depth = 50;
        button.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.isUpState = true;
            button.setTexture(defaultTexture);
        });
        button.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.isUpState = false;
            button.setTexture(hoveredTexture);
        });
        button.on(Phaser.Input.Events.POINTER_UP, () => {
            this.isUpState = true;
            button.setTexture(defaultTexture);
        });
    }

    get isDown() : boolean {
        return !this.isUp;
    }

    get isUp() : boolean {
        return this.isUpState;
    }
}

export default class InputController implements GameManager {
    public enabled: boolean;

    private aKey : Phaser.Input.Keyboard.Key;
    private dKey : Phaser.Input.Keyboard.Key;
    private leftKey : Phaser.Input.Keyboard.Key;
    private rightKey : Phaser.Input.Keyboard.Key;
    private upKey : Phaser.Input.Keyboard.Key;
    private wKey : Phaser.Input.Keyboard.Key;
    private wKeyInputButton : InputButton;
    private upKeyInputButton : InputButton;
    private gamepadAInputButton : InputButton;
    private scene : Phaser.Scene;
    private leftKeyOnScreen : OnScreenInputButton;
    private rightKeyOnScreen : OnScreenInputButton;
    private upKeyOnScreen : OnScreenInputButton;

    private gamepadAJustPressed : number;
    private upKeyOnScreenJustPressed : number;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    preload(): void {
    }

    create(): void {
        this.aKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.leftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.wKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.enabled = true;
        this.wKeyInputButton = new KeyboardInputButton(this.wKey);
        this.upKeyInputButton = new KeyboardInputButton(this.upKey);
        this.gamepadAInputButton = new GamepadAInputButton(this.scene);

        if (bridge.device.type === InstantGamesBridge.DEVICE_TYPE.MOBILE) {
            this.leftKeyOnScreen = new OnScreenInputButton(
                this.scene,
                60,
                GameHeight - 20,
                TextureKeys.LeftButtonDefault,
                TextureKeys.LeftButtonHovered
            );

            this.rightKeyOnScreen = new OnScreenInputButton(
                this.scene,
                130,
                GameHeight - 20,
                TextureKeys.RightButtonDefault,
                TextureKeys.RightButtonHovered
            );

            this.upKeyOnScreen = new OnScreenInputButton(
                this.scene,
                GameWidth - 60,
                GameHeight - 20,
                TextureKeys.UpButtonDefault,
                TextureKeys.UpButtonHovered
            );
        }
    }

    update(time: number, delta: number): void {
        const pad = this.scene.input.gamepad.getPad(0);
        if (pad && pad.A) {
            this.gamepadAJustPressed = Math.min(this.gamepadAJustPressed + 1, 2);
        } else {
            this.gamepadAJustPressed = 0;
        }

        if (this.upKeyOnScreen) {
            if (this.upKeyOnScreen.isDown) {
                this.upKeyOnScreenJustPressed = Math.min(this.upKeyOnScreenJustPressed + 1, 2);
            } else {
                this.upKeyOnScreenJustPressed = 0;
            }
        }
    }

    get isLeftDown() : boolean {
        if (!this.enabled) {
            return false;
        }

        if (this.leftKeyOnScreen && this.leftKeyOnScreen.isDown) {
            return true;
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

        if (this.rightKeyOnScreen && this.rightKeyOnScreen.isDown) {
            return true;
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

    get isUpJustDown() : boolean {
        if (!this.enabled) {
            return false;
        }

        if (this.upKeyOnScreenJustPressed == 1) {
            return true;
        }

        if (this.gamepadAJustPressed == 1) {
            return true;
        }

        return Phaser.Input.Keyboard.JustDown(this.upKey) || 
            Phaser.Input.Keyboard.JustDown(this.wKey);
    }

    get isUpDown() : boolean {
        if (!this.enabled) {
            return false;
        }

        if (this.upKeyOnScreen && this.upKeyOnScreen.isDown) {
            return true;
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

        if (this.upKeyOnScreen && this.upKeyOnScreen.isDown) {
            return this.upKeyOnScreen;
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