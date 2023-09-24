import * as Phaser from 'phaser';
import BaseScene from './BaseScene';
import AudioManager from '../Managers/AudioManager';
import CloudManager from '../Managers/CloudManager';
import SettingsManager from '../Managers/SettingsManager';
import TextureKeys from '../Consts/TextureKeys';
import FontKeys from '../Consts/FontKeys';
import SceneKeys from '../Consts/SceneKeys';

export default class PreloadScene extends BaseScene {
    constructor() {
        super(SceneKeys.Preload);

        const cloudManager = new CloudManager(this);
        const audioManager = new AudioManager(this);
        const settingsManager = new SettingsManager(this);

        this.gameManagers.push(cloudManager, audioManager, settingsManager);
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

        this.load.image(TextureKeys.TitleEn, "assets/images/ui/GameTitleEn.png");
        this.load.image(TextureKeys.TitleRu, "assets/images/ui/GameTitleRu.png");
        this.load.image(TextureKeys.EnglishFlagDefault, "assets/images/ui/EnglishFlagDefault.png");
        this.load.image(TextureKeys.EnglishFlagHovered, "assets/images/ui/EnglishFlagHovered.png");
        this.load.image(TextureKeys.RussianFlagDefault, "assets/images/ui/RussianFlagDefault.png");
        this.load.image(TextureKeys.RussianFlagHovered, "assets/images/ui/RussianFlagHovered.png");
        this.load.image(TextureKeys.StartButtonDefault, "assets/images/ui/StartButtonDefault.png");
        this.load.image(TextureKeys.StartButtonHovered, "assets/images/ui/StartButtonHovered.png");

        this.load.image("tiles", "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.tilemapTiledJSON("map", "assets/levels/maps/WelcomeScene.json");

        this.load.aseprite("noob", "assets/animations/NoobMain.png", "assets/animations/NoobMain.json");

        // LevelSelectionScene.

        this.load.image(TextureKeys.LevelButtonDefault, "assets/images/ui/LevelButtonDefault.png");
        this.load.image(TextureKeys.LevelButtonHovered, "assets/images/ui/LevelButtonHovered.png");
        this.load.image(TextureKeys.StarIconEmpty, "assets/images/ui/StarIconEmpty.png");
        this.load.image(TextureKeys.StarIconFill, "assets/images/ui/StarIconFill.png");
        this.load.image(TextureKeys.LockIcon, "assets/images/ui/LockIcon.png");
        this.load.image(TextureKeys.TickIcon, "assets/images/ui/TickIcon.png");
        this.load.image(TextureKeys.BackButtonDefault, "assets/images/ui/BackButtonDefault.png");
        this.load.image(TextureKeys.BackButtonHovered, "assets/images/ui/BackButtonHovered.png");

        this.load.bitmapFont(FontKeys.Monocraft, "assets/fonts/Monocraft.png", "assets/fonts/Monocraft.fnt");
    }

    override create(): void {
        this.scene.start(SceneKeys.Welcome);
    }
}