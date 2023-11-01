import * as Phaser from 'phaser';
import EventKeys from "../Consts/EventKeys";
import FontKeys from "../Consts/FontKeys";
import SceneKeys from "../Consts/SceneKeys";
import TextureKeys from "../Consts/TextureKeys";
import SettingsManager from "../Managers/SettingsManager";
import BaseScene from "./BaseScene";
import LevelScene from "./LevelScene";
import { ButtonScale, GameHeight, GameWidth } from '../Consts/Consts';
import { Localization, LocalizationKey } from '../StaticManagers/LocalizationStaticManager';
import LevelCompleteManager from '../Managers/LevelCompleteManager';
import InputController from '../Managers/InputController';
import { createButton } from 'src/Utils';
import { Progress } from 'src/StaticManagers/ProgressStaticManager';
import { Prefs } from 'src/StaticManagers/PrefsStaticManager';

export default class LevelUIScene extends BaseScene {
    private coinText : Phaser.GameObjects.BitmapText;
    private levelScene : LevelScene;
    private helpBoxBackground : Phaser.GameObjects.Image;
    private helpBoxText : Phaser.GameObjects.BitmapText;
    public inputController : InputController;
    private skipLevelButton : Phaser.GameObjects.Image;
    private skipLevelText : Phaser.GameObjects.BitmapText;

    constructor() {
        super(SceneKeys.LevelUI);

        const settingsManager = new SettingsManager(this, true);
        const levelCompleteManager = new LevelCompleteManager(this);
        this.inputController = new InputController(this);
        this.gameManagers.push(settingsManager, levelCompleteManager, this.inputController);
    }

    override create(): void {
        this.cameras.main.setZoom(4, 4).setOrigin(0, 0).setPosition(0, 0);
        super.create();

        this.levelScene = this.scene.get(SceneKeys.Level) as LevelScene;

        this.add.image(20, 20, TextureKeys.CoinUI).setOrigin(0.5, 0.5).setScale(ButtonScale);
        this.coinText = this.add.bitmapText(40, 20, FontKeys.Monocraft).setOrigin(0.0, 0.5).setScale(ButtonScale);
        this.helpBoxBackground = this.add.image(GameWidth / 2, 40, TextureKeys.HelpBoxBackground)
            .setVisible(false);

        this.helpBoxText = this.add.bitmapText(GameWidth / 2 - 118, 25, FontKeys.Monocraft)
            .setOrigin(0, 0)
            .setVisible(false);

        // Skip button.

        if (this.levelScene.level <= Prefs.getCompletedLevel()) {
            this.skipLevelButton = undefined;
            this.skipLevelText = undefined;
        } else {
            this.skipLevelButton = this.add.image(
                GameWidth - 100,
                23, 
                TextureKeys.SkipLevelButtonDefault
            )
                .setDepth(-1);

            this.skipLevelText = this.add.bitmapText(
                this.skipLevelButton.x - 18, 
                this.skipLevelButton.y,
                FontKeys.Monocraft,
                Localization.getText(LocalizationKey.SkipLevel)
            )
                .setDepth(-1)
                .setTint(0x000000)
                .setOrigin(0, 0.5);

            createButton(this.skipLevelButton, {
                defaultTexture: TextureKeys.SkipLevelButtonDefault,
                hoveredTexture: TextureKeys.SkipLevelButtonHovered,
                onClick: () => {
                    bridge.advertisement.showRewarded();
                }
            });
        }

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

        if (this.skipLevelButton && this.skipLevelText) {
            this.skipLevelButton.visible = false;
            this.skipLevelText.visible = false;
        }
    }

    private hideHelpBox() {
        this.helpBoxBackground.visible = false;
        this.helpBoxText.visible = false;

        if (this.skipLevelButton && this.skipLevelText) {
            this.skipLevelButton.visible = true;
            this.skipLevelText.visible = true;
        }
    }

    private updateUI() {
        if (this.levelScene.coinManager.pickedCoins === undefined || 
            this.levelScene.coinManager.coinsCount === undefined)
            return;

        this.coinText.setText(`${this.levelScene.coinManager.pickedCoins}/${this.levelScene.coinManager.coinsCount}`);
    }
}