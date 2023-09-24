import * as Phaser from 'phaser';
import { GameHeight, GameWidth } from "../Consts/Consts";
import TextureKeys from "../Consts/TextureKeys";
import { GameManager } from "../Scenes/BaseScene";
import { createButton } from "../Utils";
import FontKeys from '../Consts/FontKeys';
import { Localization, LocalizationKey } from '../LocalizationStaticManager';
import EventKeys from '../Consts/EventKeys';
import SceneKeys from '../Consts/SceneKeys';

class SettingsContainer extends Phaser.GameObjects.Container {

    private titleText : Phaser.GameObjects.BitmapText;
    private backButtonText : Phaser.GameObjects.BitmapText;
    private menuButtonText : Phaser.GameObjects.BitmapText;

    constructor(scene: Phaser.Scene, x: number, y: number, showMenuButton:boolean) {
        super(scene, x, y);

        const background = scene.add.image(0, 0, TextureKeys.SettingsBodyBackground).setOrigin(0.5, 0.5);
        const titleBackground = scene.add.image(0, -background.height / 2, TextureKeys.SettingsTitleBackground);
        this.titleText = scene.add.bitmapText(0, -background.height / 2 - 5, FontKeys.Monocraft)
            .setOrigin(0.5, 0.5)
            .setScale(2);
        const backButton = scene.add.image(0, background.height / 2 - 25, TextureKeys.SettingsButtonDefault);
        this.backButtonText = scene.add.bitmapText(0, backButton.y, FontKeys.Monocraft)
            .setOrigin(0.5, 0.5)
            .setTint(0x000000);
        
        var py = -background.height / 2 + 50;
        var menuButton : Phaser.GameObjects.Image;
        if (showMenuButton) {
            menuButton = scene.add.image(0, py, TextureKeys.SettingsButtonDefault);
            this.menuButtonText = scene.add.bitmapText(0, menuButton.y, FontKeys.Monocraft)
                .setOrigin(0.5, 0.5)
                .setTint(0x000000);

            createButton(menuButton, {
                defaultTexture: TextureKeys.SettingsButtonDefault,
                hoveredTexture: TextureKeys.SettingsButtonHovered,
                onClick: () => this.scene.scene.start(SceneKeys.Welcome)
            });

            py += 50;
        }

        createButton(backButton, {
            defaultTexture: TextureKeys.SettingsButtonDefault,
            hoveredTexture: TextureKeys.SettingsButtonHovered,
            onClick: () => this.hide()
        });

        this.add(background);
        this.add(backButton);
        this.add(titleBackground);
        this.add(this.titleText);
        if (showMenuButton) {
            this.add(menuButton);
            this.add(this.menuButtonText);
        }
        this.add(backButton);
        this.add(this.backButtonText);

        this.visible = false;
        this.depth = 100;

        background.setInteractive();

        scene.events.on(EventKeys.LanguageSelected, this.updateText, this);
        this.on("destroy", () => {
            scene.events.off(EventKeys.LanguageSelected, this.updateText);
        });

        this.updateText();
    }

    updateText() {
        this.titleText.setText(Localization.getText(LocalizationKey.SettingsTitle));
        this.backButtonText.setText(Localization.getText(LocalizationKey.Back));
        if (this.menuButtonText) {
            this.menuButtonText.setText(Localization.getText(LocalizationKey.SettingsMenuButton));
        }
    }

    get visibility() : boolean {
        return this.visible;
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }
}

export default class SettingsManager implements GameManager {
    private scene : Phaser.Scene;
    private settingsContainer : SettingsContainer;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    preload(): void {
        this.scene.load.image(TextureKeys.GearIconDefault, "assets/images/ui/GearIconDefault.png");
        this.scene.load.image(TextureKeys.GearIconHovered, "assets/images/ui/GearIconHovered.png");
        this.scene.load.image(TextureKeys.SettingsBodyBackground, "assets/images/ui/SettingsBodyBackground.png");
        this.scene.load.image(TextureKeys.SettingsTitleBackground, "assets/images/ui/SettingsTitleBackground.png");
        this.scene.load.image(TextureKeys.SettingsButtonDefault, "assets/images/ui/SettingsButtonDefault.png");
        this.scene.load.image(TextureKeys.SettingsButtonHovered, "assets/images/ui/SettingsButtonHovered.png");

        this.scene.load.bitmapFont(FontKeys.Monocraft, "assets/fonts/Monocraft.png", "assets/fonts/Monocraft.fnt");
    }

    create(): void {
        const gearButton = this.scene.add.image(GameWidth - 22, 22, TextureKeys.GearIconDefault);
        this.settingsContainer = new SettingsContainer(this.scene, GameWidth / 2, GameHeight / 2, true);

        this.scene.add.existing(this.settingsContainer);

        createButton(gearButton, {
            defaultTexture: TextureKeys.GearIconDefault,
            hoveredTexture: TextureKeys.GearIconHovered,
            onClick: () => {
                if (this.settingsContainer.visibility) {
                    this.settingsContainer.hide();
                } else {
                    this.settingsContainer.show();
                }
            }
        })
    }

    update(time: number, delta: number): void {    
    }
}