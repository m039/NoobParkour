import * as Phaser from 'phaser';
import { ButtonScale, GameHeight, GameWidth } from "../Consts/Consts";
import TextureKeys from "../Consts/TextureKeys";
import { GameManager } from "../Scenes/BaseScene";
import { createButton } from "../Utils";
import FontKeys from '../Consts/FontKeys';
import { Localization, LocalizationKey } from '../StaticManagers/LocalizationStaticManager';
import EventKeys from '../Consts/EventKeys';
import SceneKeys from '../Consts/SceneKeys';
import AudioScene from '../Scenes/AudioScene';

class SettingsContainer extends Phaser.GameObjects.Container {

    private shadow : Phaser.GameObjects.Rectangle;
    private titleText : Phaser.GameObjects.BitmapText;
    private backButtonText : Phaser.GameObjects.BitmapText;
    private menuButtonText : Phaser.GameObjects.BitmapText;
    private isAnimating : boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, showMenuButton:boolean) {
        super(scene, x, y);

        const background = scene.add.image(0, 0, TextureKeys.SettingsBodyBackground).setOrigin(0.5, 0.5);
        const titleBackground = scene.add.image(0, -background.height / 2, TextureKeys.SettingsTitleBackground);
        this.titleText = scene.add.bitmapText(0, -background.height / 2 - 5, FontKeys.Monocraft)
            .setOrigin(0.5, 0.5)
            .setScale(2);
        const backButton = scene.add.image(0, background.height / 2 - 25, TextureKeys.SettingsButtonDefault);
        createButton(backButton, {
            defaultTexture: TextureKeys.SettingsButtonDefault,
            hoveredTexture: TextureKeys.SettingsButtonHovered,
            onClick: () => this.hide()
        });
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
                onClick: () => {
                    this.scene.scene.stop(SceneKeys.Level);
                    this.scene.scene.stop(SceneKeys.LevelUI);
                    this.scene.scene.start(SceneKeys.Welcome);
                }
            });

            py += 40;
        }

        const audioManager = (scene.scene.get(SceneKeys.Audio) as AudioScene).audioManager;

        const musicIcon = scene.add.image(-25, py, TextureKeys.MusicIconDefault);
        const disableMusicIcon = scene.add.image(musicIcon.x, musicIcon.y, TextureKeys.DisableIcon)
            .setVisible(!audioManager.musicEnabled);

        createButton(musicIcon, {
            defaultTexture: TextureKeys.MusicIconDefault,
            hoveredTexture: TextureKeys.MusicIconHovered,
            onClick: () => { 
                audioManager.musicEnabled = !audioManager.musicEnabled;
                disableMusicIcon.visible = !audioManager.musicEnabled;
             }
        });

        const soundIcon = scene.add.image(25, py, TextureKeys.SoundIconDefault);
        const disableSoundIcon = scene.add.image(soundIcon.x, soundIcon.y, TextureKeys.DisableIcon)
            .setVisible(!audioManager.soundEnabled);

        createButton(soundIcon, {
            defaultTexture: TextureKeys.SoundIconDefault,
            hoveredTexture: TextureKeys.SoundIconHovered,
            onClick: () => { 
                audioManager.soundEnabled = !audioManager.soundEnabled; 
                disableSoundIcon.visible = !audioManager.soundEnabled;
            }
        });

        // Add all images to the container.
        this.add(background);
        this.add(backButton);
        this.add(titleBackground);
        this.add(this.titleText);
        if (showMenuButton) {
            this.add(menuButton);
            this.add(this.menuButtonText);
        }
        this.add(musicIcon);
        this.add(disableMusicIcon);
        this.add(soundIcon);
        this.add(disableSoundIcon);
        this.add(backButton);
        this.add(this.backButtonText);

        this.visible = false;
        this.depth = 100;

        this.shadow = scene.add.rectangle(0, 0, GameWidth, GameHeight, 0x000000)
            .setOrigin(0, 0)
            .setVisible(false)
            .setDepth(99)
            .setInteractive();

        scene.events.on(EventKeys.LanguageSelected, this.updateText, this);
        this.on(Phaser.GameObjects.Events.DESTROY, () => {
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

    public show() {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;
        this.visible = true;
        
        this.shadow.visible = true;
        this.shadow.alpha = 0;
        this.scene.tweens.add({
            targets: this.shadow,
            alpha: 0.5,
            repeat: 0,
            ease: Phaser.Math.Easing.Sine.Out,
            duration: 800
        });

        this.setPosition(GameWidth / 2, -GameHeight/2);
        this.scene.tweens.add({
            targets: this,
            y : GameHeight / 2,
            repeat: 0,
            ease: Phaser.Math.Easing.Back.Out,
            duration: 800,
            onComplete: () => this.isAnimating = false
        });
    }

    public hide() {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;
        this.scene.tweens.add({
            targets: this.shadow,
            alpha: 0.0,
            repeat: 0,
            ease: Phaser.Math.Easing.Sine.In,
            duration: 800
        });
        this.scene.tweens.add({
            targets: this,
            y: -GameHeight / 2,
            repeat: 0,
            ease: Phaser.Math.Easing.Back.In,
            duration: 800,
            onComplete: () => {
                this.isAnimating = false;
                this.visible = false;
                this.shadow.visible = false;
            }
        });
    }
}

export default class SettingsManager implements GameManager {
    private scene : Phaser.Scene;
    private settingsContainer : SettingsContainer;
    private showMenuButton : boolean;

    constructor(scene: Phaser.Scene, showMenuButton:boolean = false) {
        this.scene = scene;
        this.showMenuButton = showMenuButton;
    }

    preload(): void {
    }

    create(): void {
        const gearButton = this.scene.add.image(GameWidth - 22, 22, TextureKeys.GearIconDefault).setScale(ButtonScale);
        this.settingsContainer = new SettingsContainer(this.scene, GameWidth / 2, GameHeight / 2, this.showMenuButton);

        this.scene.add.existing(this.settingsContainer);

        createButton(gearButton, {
            defaultTexture: TextureKeys.GearIconDefault,
            hoveredTexture: TextureKeys.GearIconHovered,
            onClick: () => {
                if (this.settingsContainer.visible) {
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