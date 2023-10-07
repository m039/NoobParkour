import * as Phaser from 'phaser';
import EventKeys from "../Consts/EventKeys";
import { GameManager } from "../Scenes/BaseScene";
import SceneKeys from '../Consts/SceneKeys';
import TextureKeys from '../Consts/TextureKeys';
import { GameHeight, GameWidth } from '../Consts/Consts';
import FontKeys from '../Consts/FontKeys';
import { Localization, LocalizationKey } from '../StaticManagers/LocalizationStaticManager';
import LevelScene from '../Scenes/LevelScene';
import { createButton } from '../Utils';

class LevelCompleteScreen extends Phaser.GameObjects.Container {
    private shadow : Phaser.GameObjects.Rectangle;

    constructor(scene:Phaser.Scene) {
        super(scene, GameWidth / 2, GameHeight / 2);

        const coinManager = (scene.scene.get(SceneKeys.Level) as LevelScene).coinManager;

        const background = scene.add.image(0, 0, TextureKeys.SettingsBodyBackground).setOrigin(0.5, 0.5);
        const titleBackground = scene.add.image(0, -background.height / 2, TextureKeys.SettingsTitleBackground);
        const titleText = scene.add.bitmapText(0, -background.height / 2 - 5, FontKeys.Monocraft)
            .setOrigin(0.5, 0.5)
            .setText(Localization.getText(LocalizationKey.LevelCompleTitle))
            .setCenterAlign()
            .setScale(1);

        const star = scene.add.image(
            0, 
            -background.height / 2 + 50, 
            coinManager.coinsCount === coinManager.pickedCoins? TextureKeys.BigStarFill : TextureKeys.BigStarEmpty
        );

        const coin = scene.add.image(-10, star.y + 30, TextureKeys.CoinUI);
        const coinText = scene.add.bitmapText(2, star.y + 30, FontKeys.Monocraft)
            .setOrigin(0, 0.5)
            .setText(coinManager.pickedCoins + "/" + coinManager.coinsCount);
        
        const nextButton = scene.add.image(30, 50, TextureKeys.NextButtonDefault);

        createButton(nextButton, {
            defaultTexture: TextureKeys.NextButtonDefault,
            hoveredTexture: TextureKeys.NextButtonHovered,
            onClick: () => {
                const levelScene = this.scene.scene.get(SceneKeys.Level) as LevelScene;
                levelScene.scene.restart({level: levelScene.level + 1});

                const levelUIScene = this.scene.scene.get(SceneKeys.LevelUI);
                levelUIScene.scene.restart();
            }
        });

        const repeatButton = scene.add.image(-30, 50, TextureKeys.RepeatButtonDefault);

        createButton(repeatButton, {
            defaultTexture: TextureKeys.RepeatButtonDefault,
            hoveredTexture: TextureKeys.RepeatButtonHovered,
            onClick: () => {
                const levelScene = this.scene.scene.get(SceneKeys.Level) as LevelScene;
                levelScene.scene.restart({level: levelScene.level});

                const levelUIScene = this.scene.scene.get(SceneKeys.LevelUI);
                levelUIScene.scene.restart();
            }
        });

        this.add(background);
        this.add(titleBackground);
        this.add(titleText);
        this.add(star);
        this.add(coin);
        this.add(coinText);
        this.add(nextButton);
        this.add(repeatButton);

        this.visible = false;
        this.depth = 100;

        this.shadow = scene.add.rectangle(0, 0, GameWidth, GameHeight, 0x000000)
            .setOrigin(0, 0)
            .setVisible(false)
            .setDepth(99)
            .setInteractive();
    }

    public show() {
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
            duration: 800
        });
    }
}

export default class LevelCompleteManager implements GameManager {
    private scene : Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    preload(): void {
    }

    create(): void {
        const levelScene = this.scene.scene.get(SceneKeys.Level);
    
        levelScene.events.on(EventKeys.LevelCompleted, this.onLevelCompleted, this);
        levelScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            levelScene.events.off(EventKeys.LevelCompleted, this.onLevelCompleted);
        });
    }

    onLevelCompleted() {
        const levelCompleteScreen = new LevelCompleteScreen(this.scene);
        this.scene.add.existing(levelCompleteScreen);
        levelCompleteScreen.show();
    }

    update(time: number, delta: number): void {
    }
}