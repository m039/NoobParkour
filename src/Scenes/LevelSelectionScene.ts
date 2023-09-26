import * as Phaser from 'phaser';
import { Localization, LocalizationKey } from '../StaticManagers/LocalizationStaticManager';
import { GameHeight, GameWidth } from '../Consts/Consts';
import CloudManager from '../Managers/CloudManager';
import { Progress } from '../StaticManagers/ProgressStaticManager';
import BaseScene from './BaseScene';
import { createButton } from '../Utils';
import TextureKeys from '../Consts/TextureKeys';
import SceneKeys from '../Consts/SceneKeys';
import FontKeys from '../Consts/FontKeys';

class LevelButton {
    private image : Phaser.GameObjects.Image;
    private star: Phaser.GameObjects.Image;
    private lock: Phaser.GameObjects.Image;
    private tick: Phaser.GameObjects.Image;

    constructor(scene: LevelSelectionScene, level: number, x:number, y:number) {
        this.image = scene.add.image(x, y, TextureKeys.LevelButtonDefault);

        scene.add.bitmapText(x, y, FontKeys.Monocraft, level.toString())
            .setOrigin(0.5, 0.5)
            .setScale(1.5)
            .setTint(0x000000);

        this.star = scene.add.image(x, y + 16, TextureKeys.StarIconEmpty).setVisible(false);
        this.lock = scene.add.image(x, y + 16, TextureKeys.LockIcon).setVisible(false);
        this.tick = scene.add.image(x + 16, y - 16, TextureKeys.TickIcon).setVisible(false);

        createButton(this.image, {
            defaultTexture: TextureKeys.LevelButtonDefault,
            hoveredTexture: TextureKeys.LevelButtonHovered,
            onClick: () => {
                if (Progress.isLevelOpen(level)) {
                    scene.scene.start(SceneKeys.Level, {level: level});
                    scene.scene.launch(SceneKeys.LevelUI);
                }
            }
        });
    }

    public setStarFill(value: boolean) {
        this.star.setTexture(value?TextureKeys.StarIconFill:TextureKeys.StarIconEmpty);
    }

    public setStarVisible(visible: boolean) {
        this.star.visible = visible;
    }

    public setLockVisible(visible: boolean) {
        this.lock.visible = visible;
    }

    public setTickVisible(visible: boolean) {
        this.tick.visible = visible;
    }

    public setButtonInteractive(value: boolean) {
        if (value) {
            this.image.setInteractive();
        } else {
            this.image.disableInteractive();
        }
    }
}

export default class LevelSelectionScene extends BaseScene {
    constructor() {
        super({key: SceneKeys.LevelSelection});
        const cloudManager = new CloudManager(this, {count: 15, bounds: new Phaser.Geom.Rectangle(-40, 0, GameWidth+80, GameHeight)});

        this.gameManagers.push(cloudManager);
    }

    override preload() {
        super.preload();

        this.load.image(TextureKeys.LevelButtonDefault, "assets/images/ui/LevelButtonDefault.png");
        this.load.image(TextureKeys.LevelButtonHovered, "assets/images/ui/LevelButtonHovered.png");
        this.load.image(TextureKeys.StarIconEmpty, "assets/images/ui/StarIconEmpty.png");
        this.load.image(TextureKeys.StarIconFill, "assets/images/ui/StarIconFill.png");
        this.load.image(TextureKeys.LockIcon, "assets/images/ui/LockIcon.png");
        this.load.image(TextureKeys.TickIcon, "assets/images/ui/TickIcon.png");
        this.load.image(TextureKeys.BackButtonDefault, "assets/images/ui/BackButtonDefault.png");
        this.load.image(TextureKeys.BackButtonHovered, "assets/images/ui/BackButtonHovered.png");
        this.load.image(TextureKeys.TitleBackground, "assets/images/ui/TitleBackground.png");

        this.load.bitmapFont(FontKeys.Monocraft, "assets/fonts/Monocraft.png", "assets/fonts/Monocraft.fnt");
    }

    override create() {
        super.create();

        this.cameras.main.setZoom(4.0, 4.0)
            .setOrigin(0, 0)
            .setPosition(0, 0);

        this.add.image(GameWidth / 2, 30, TextureKeys.TitleBackground)
            .setAlpha(0.7);

        this.add.bitmapText(GameWidth / 2, 28, FontKeys.Monocraft, Localization.getText(LocalizationKey.SelectLevelTitle))
            .setScale(2.0)
            .setOrigin(0.5, 0.5);

        this.createButtons();
        this.createBackButton();
    }

    private createBackButton() {
        const button = this.add.image(30, 30, TextureKeys.BackButtonDefault);

        createButton(button, {
            defaultTexture: TextureKeys.BackButtonDefault,
            hoveredTexture: TextureKeys.BackButtonHovered,
            onClick: () => this.scene.start(SceneKeys.Welcome)
        });
    }

    private createButtons() : void {
        const hSpacing = 60;
        const vSpacing = 45;
        const rows = 4;
        const columns = 5;
        const startX = GameWidth / 2 - hSpacing * (columns - 1) / 2;
        const startY = GameHeight / 2 - vSpacing * (rows - 1) / 2 + 15;
        var level = 1;

        for (var row = 0; row < rows; row++) {
            for (var column = 0; column < columns; column++) {
                const x = startX + column * hSpacing;
                const y = startY + row * vSpacing;

                const levelButton = new LevelButton(this, level, x, y);

                levelButton.setStarFill(Progress.isLevelCompletedFully(level));
                levelButton.setTickVisible(Progress.isLevelCompleted(level));
                levelButton.setButtonInteractive(Progress.isLevelOpen(level));

                if (Progress.isLevelOpen(level) || Progress.isLevelCompleted(level)) {
                    levelButton.setLockVisible(false);
                    levelButton.setStarVisible(Progress.isLevelCompleted(level) && Progress.isLevelCompleted(level));
                } else {
                    levelButton.setLockVisible(true);
                    levelButton.setStarVisible(false);
                }


                level++;
            }
        }
    }
}