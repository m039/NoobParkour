import * as Phaser from 'phaser';
import EventKeys from "../Consts/EventKeys";
import FontKeys from "../Consts/FontKeys";
import SceneKeys from "../Consts/SceneKeys";
import TextureKeys from "../Consts/TextureKeys";
import SettingsManager from "../Managers/SettingsManager";
import BaseScene from "./BaseScene";
import LevelScene from "./LevelScene";
import { GameWidth } from '../Consts/Consts';
import { Localization, LocalizationKey } from '../StaticManagers/LocalizationStaticManager';
import LevelCompleteManager from '../Managers/LevelCompleteManager';

export default class LevelUIScene extends BaseScene {
    private coinText : Phaser.GameObjects.BitmapText;
    private levelScene : LevelScene;
    private helpBoxBackground : Phaser.GameObjects.Image;
    private helpBoxText : Phaser.GameObjects.BitmapText;

    constructor() {
        super(SceneKeys.LevelUI);

        const settingsManager = new SettingsManager(this, true);
        const levelCompleteManager = new LevelCompleteManager(this);
        this.gameManagers.push(settingsManager, levelCompleteManager);
    }

    override create(): void {
        this.cameras.main.setZoom(4, 4).setOrigin(0, 0).setPosition(0, 0);
        super.create();

        this.levelScene = this.scene.get(SceneKeys.Level) as LevelScene;

        this.add.image(25, 20, TextureKeys.CoinUI).setOrigin(0.5, 0.5);
        this.coinText = this.add.bitmapText(40, 20, FontKeys.Monocraft).setOrigin(0.0, 0.5);
        this.helpBoxBackground = this.add.image(GameWidth / 2, 40, TextureKeys.HelpBoxBackground)
            .setVisible(false);

        this.helpBoxText = this.add.bitmapText(GameWidth / 2 - 118, 25, FontKeys.Monocraft)
            .setOrigin(0, 0)
            .setVisible(false);

        const self = this;
        this.levelScene.events.on(EventKeys.CoinPickUp, this.updateUI, self);
        this.levelScene.events.on(EventKeys.LevelRestart, this.updateUI, self);
        this.levelScene.events.on(EventKeys.ShowHelpBox, this.showHelpBox, self);
        this.levelScene.events.on(EventKeys.HideHelpBox, this.hideHelpBox, self);
        this.levelScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.levelScene.events.off(EventKeys.CoinPickUp, this.updateUI, self);
            this.levelScene.events.off(EventKeys.LevelRestart, this.updateUI, self);
            this.levelScene.events.off(EventKeys.ShowHelpBox, this.showHelpBox, self);
            this.levelScene.events.off(EventKeys.HideHelpBox, this.hideHelpBox, self);
        });
        this.updateUI();
    }

    private showHelpBox(textKey: string) {
        this.helpBoxBackground.visible = true;
        this.helpBoxText.visible = true;
        this.helpBoxText.setText(Localization.getText(textKey as LocalizationKey));
    }

    private hideHelpBox() {
        this.helpBoxBackground.visible = false;
        this.helpBoxText.visible = false;
    }

    private updateUI() {
        if (this.levelScene.coinManager.pickedCoins === undefined || 
            this.levelScene.coinManager.coinsCount === undefined)
            return;

        this.coinText.setText(`${this.levelScene.coinManager.pickedCoins}/${this.levelScene.coinManager.coinsCount}`);
    }
}