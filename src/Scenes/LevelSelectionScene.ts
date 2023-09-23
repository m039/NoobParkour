import * as Phaser from 'phaser';
import { Localization, LocalizationKey } from '../LocalizationStaticManager';
import { GameHeight, GameWidth } from '../Consts';
import CloudManager from '../CloudManager';
import { Progress } from '../ProgressStaticManager';
import AudioManager, { SoundId } from '../AudioManager';
import BaseScene from './BaseScene';

class LevelButton {
    private audioManager: AudioManager;
    private image : Phaser.GameObjects.Image;
    private star: Phaser.GameObjects.Image;
    private lock: Phaser.GameObjects.Image;
    private tick: Phaser.GameObjects.Image;

    constructor(scene: LevelSelectionScene, level: number, x:number, y:number) {
        this.image = scene.add.image(x, y, "level_button_default");

        scene.add.bitmapText(x, y, "monocraft", level.toString())
            .setOrigin(0.5, 0.5)
            .setScale(1.5)
            .setTint(0x000000);

        this.star = scene.add.image(x, y + 16, "star_icon_empty").setVisible(false);
        this.lock = scene.add.image(x, y + 16, "lock_icon").setVisible(false);
        this.tick = scene.add.image(x + 16, y - 16, "tick_icon").setVisible(false);
        this.audioManager = scene.audioManager;

        this.constructButton();
    }

    public constructButton() {
        this.image.setInteractive();
        this.image.on("pointerover", () => {
            this.image.setTexture("level_button_hovered");
            this.audioManager.play(SoundId.Blip);
        });
        this.image.on("pointerout", () => {
            this.image.setTexture("level_button_default");
        })
    }

    public setStarFill(value: boolean) {
        this.star.setTexture(value?"star_icon_fill":"star_icon_empty");
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
}

export default class LevelSelectionScene extends BaseScene {
    public audioManager: AudioManager;

    constructor() {
        super({key: "LevelSelectionScene"});
        const cloudManager = new CloudManager(this, {count: 15, bounds: new Phaser.Geom.Rectangle(-40, 0, GameWidth+80, GameHeight)});
        this.audioManager = new AudioManager(this);

        this.gameManagers.push(cloudManager, this.audioManager);
    }

    override preload() {
        super.preload();

        this.load.image("level_button_default", "assets/images/ui/LevelButtonDefault.png");
        this.load.image("level_button_hovered", "assets/images/ui/LevelButtonHovered.png");
        this.load.image("star_icon_empty", "assets/images/ui/StarIconEmpty.png");
        this.load.image("star_icon_fill", "assets/images/ui/StarIconFill.png");
        this.load.image("lock_icon", "assets/images/ui/LockIcon.png");
        this.load.image("tick_icon", "assets/images/ui/TickIcon.png");
        this.load.image("back_button_default", "assets/images/ui/BackButtonDefault.png");
        this.load.image("back_button_hovered", "assets/images/ui/BackButtonHovered.png");

        this.load.bitmapFont("monocraft", "assets/fonts/Monocraft.png", "assets/fonts/Monocraft.fnt");
    }

    override create() {
        super.create();

        this.cameras.main.setZoom(4.0, 4.0)
            .setOrigin(0, 0)
            .setPosition(0, 0);

        this.add.bitmapText(GameWidth / 2, 30, "monocraft", Localization.getText(LocalizationKey.SelectLevelTitle))
            .setScale(2.0)
            .setOrigin(0.5, 0.5)
            .setTint(0x000000);

        this.createButtons();
        this.createBackButton();
    }

    private createBackButton() {
        const button = this.add.image(30, 30, "back_button_default");

        button.setInteractive();
        button.on("pointerover", () => {
            button.setTexture("back_button_hovered");
        });
        button.on("pointerout", () => {
            button.setTexture("back_button_default");
        });
        button.on("pointerup", () => {
            this.scene.start("WelcomeScene");
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