import * as Phaser from 'phaser';

import SceneKeys from "src/Consts/SceneKeys";
import BaseScene from "./BaseScene";
import { GameHeight, GameWidth } from 'src/Consts/Consts';
import FontKeys from 'src/Consts/FontKeys';
import TextureKeys from 'src/Consts/TextureKeys';
import { Localization, LocalizationKey } from 'src/StaticManagers/LocalizationStaticManager';
import LevelScene from './LevelScene';
import LevelUIScene from './LevelUIScene';
import AudioScene from './AudioScene';

export default class AdScene extends BaseScene {

    private background : Phaser.GameObjects.Rectangle;

    private container : Phaser.GameObjects.Container;

    private titleText : Phaser.GameObjects.BitmapText;

    private counterText : Phaser.GameObjects.BitmapText;

    private hand : Phaser.GameObjects.Image;

    private intervalId : NodeJS.Timer;

    private pressToContinue : boolean;

    public get visible() {
        return this.container && this.container.visible;
    }

    constructor() {
        super({key:SceneKeys.Ad});
    }

    override create(): void {
        super.create();

        this.cameras.main.setZoom(4, 4).setOrigin(0, 0).setPosition(0, 0);

        this.background = this.add.rectangle(0, 0, GameWidth, GameHeight, 0x000000, 0.5)
            .setOrigin(0, 0)
            .setInteractive()
            .setVisible(true);

        this.background.on("pointerup", () => {
            this.onBackgroundClick();
        });

        this.titleText = this.add.bitmapText(GameWidth / 2, 80, FontKeys.Monocraft)
            .setOrigin(0.5)
            .setScale(2);

        this.counterText = this.add.bitmapText(GameWidth / 2, GameHeight / 2, FontKeys.Monocraft)
            .setOrigin(0.5)
            .setScale(4);

        this.hand = this.add.image(GameWidth / 2, GameHeight / 2, TextureKeys.Hand)
            .setOrigin(0.5)
            .setVisible(false)
            .setScale(2);
        
        this.container = this.add.container();

        this.container.add(this.background);
        this.container.add(this.titleText);
        this.container.add(this.counterText);
        this.container.add(this.hand);

        this.container.visible = false;
    }

    public startAd() : void {
        if (!bridge.advertisement.isInterstitialReady) {
            return;
        }

        this.scene.pause(SceneKeys.Level);

        const audioScene = this.scene.get(SceneKeys.Audio) as AudioScene;
        audioScene.audioManager.disable();

        this.container.visible = true;
        this.pressToContinue = false;

        const LevelUIScene = this.scene.get(SceneKeys.LevelUI) as LevelUIScene;
        LevelUIScene.inputController.reset();

        this.hand.visible = false;
        this.titleText.text = Localization.getText(LocalizationKey.AdTitle);
        let numberLeft = 2;
        this.counterText.text = numberLeft.toString();
        this.counterText.visible = true;

        this.intervalId = setInterval(() => {
            numberLeft--;

            if (numberLeft == 0) {
                bridge.advertisement.showInterstitial();
                this.counterText.visible = false;
            } else if (numberLeft < 0) {
                clearInterval(this.intervalId);

                this.hand.visible = true;
                this.titleText.text = Localization.getText(LocalizationKey.AdContinue);
                this.pressToContinue = true;
            } else {
                this.counterText.text = numberLeft.toString();
            }
        }, 1000);
    }

    private onBackgroundClick() : void {
        if (this.pressToContinue) {
            this.container.visible = false;
            this.scene.resume(SceneKeys.Level);

            const audioScene = this.scene.get(SceneKeys.Audio) as AudioScene;
            audioScene.audioManager.enable();
        }
    }

}