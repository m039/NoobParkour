import * as Phaser from 'phaser';
import BaseScene from './BaseScene';
import AudioManager from '../AudioManager';
import CloudManager from '../CloudManager';

export default class PreloadScene extends BaseScene {
    constructor() {
        super("PreloadScene");

        const cloudManager = new CloudManager(this);
        const audioManager = new AudioManager(this);

        this.gameManagers.push(cloudManager, audioManager);
    }

    override preload(): void {
        var progress = this.add.graphics();
        this.load.on('progress', function (value) {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, 1080 / 2 - 30, 1920 * value, 60);
        });

        this.load.on('complete', function () {
            progress.destroy();
        });

        super.preload();

        // WelcomeScene.

        this.load.image("title_en", "assets/images/ui/GameTitleEn.png");
        this.load.image("title_ru", "assets/images/ui/GameTitleRu.png");
        this.load.image("english_flag_default", "assets/images/ui/EnglishFlagDefault.png");
        this.load.image("english_flag_hovered", "assets/images/ui/EnglishFlagHovered.png");
        this.load.image("russian_flag_default", "assets/images/ui/RussianFlagDefault.png");
        this.load.image("russian_flag_hovered", "assets/images/ui/RussianFlagHovered.png");
        this.load.image("start_button_default", "assets/images/ui/StartButtonDefault.png");
        this.load.image("start_button_hovered", "assets/images/ui/StartButtonHovered.png");

        this.load.image("tiles", "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.tilemapTiledJSON("map", "assets/levels/maps/WelcomeScene.json");

        this.load.aseprite("noob", "assets/animations/NoobMain.png", "assets/animations/NoobMain.json");

        // LevelSelectionScene.

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

    override create(): void {
        this.scene.start("WelcomeScene");
    }
}