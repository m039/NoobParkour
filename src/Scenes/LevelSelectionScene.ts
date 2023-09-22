import * as Phaser from 'phaser';
import { Localization, LocalizationKey } from '../LocalizationStaticManager';
import { GameHeight, GameWidth } from '../Consts';
import CloudManager from '../CloudManager';

class LevelButton {
    private image : Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, level: number, x:number, y:number) {
        this.image = scene.add.image(x, y, "level_button_default");

        scene.add.bitmapText(x, y, "monocraft", level.toString())
            .setOrigin(0.5, 0.5)
            .setScale(1.5)
            .setTint(0x000000);
    }
}

export default class LevelSelectionScene extends Phaser.Scene {
    private cloudManager: CloudManager;

    constructor() {
        super({key: "LevelSelectionScene"});
        this.cloudManager = new CloudManager(this, {count: 15, bounds: new Phaser.Geom.Rectangle(-40, 0, GameWidth+80, GameHeight)});
    }

    preload() {
        this.cloudManager.preload();
        this.load.image("level_button_default", "assets/images/ui/LevelButtonDefault.png");
        this.load.bitmapFont("monocraft", "assets/fonts/Monocraft.png", "assets/fonts/Monocraft.fnt");
    }

    create() {
        this.cloudManager.create();

        this.cameras.main.setZoom(4.0, 4.0)
            .setOrigin(0, 0)
            .setPosition(0, 0);

        this.add.bitmapText(GameWidth / 2, 30, "monocraft", Localization.getText(LocalizationKey.SelectLevelTitle))
            .setScale(2.0)
            .setOrigin(0.5, 0.5)
            .setTint(0x000000);

        this.createButtons();
    }

    update(time: number, delta: number): void {
        this.cloudManager.update(time, delta);
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

                level++;
            }
        }
    }
}