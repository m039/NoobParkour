import BaseScene from './BaseScene';
import TextureKeys from '../Consts/TextureKeys';
import FontKeys from '../Consts/FontKeys';
import SceneKeys from '../Consts/SceneKeys';
import { Prefs } from '../StaticManagers/PrefsStaticManager';
import development from "consts:development";
import SoundKeys from '../Consts/SoundKeys';
import AsepriteKeys from 'src/Consts/AsepriteKeys';
import ShaderKeys from 'src/Consts/ShaderKeys';
import { Progress } from 'src/StaticManagers/ProgressStaticManager';
import { MaxLevels } from 'src/Consts/Consts';

export default class PreloadScene extends BaseScene {
    constructor() {
        super(SceneKeys.Preload);
    }

    override preload(): void {
        // Load and sync the preferences.
        Prefs.load();
        Prefs.syncFromCloud();

        // Hide the loader.
        var loader = document.getElementById("loader");
        if (loader) {
            loader.style.display = "none";
        }

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

        // Sounds and music.

        this.load.audio(SoundKeys.Jump2, "assets/audio/sounds/jump2.wav");
        this.load.audio(SoundKeys.Coin1, "assets/audio/sounds/coin1.mp3");
        this.load.audio(SoundKeys.Loose1, "assets/audio/sounds/loose1.wav");
        this.load.audio(SoundKeys.Blip1, "assets/audio/sounds/blipSelect1.wav");
        this.load.audio(SoundKeys.MenuMusic, "assets/audio/music/Retro Beat.mp3");
        this.load.audio(SoundKeys.Game1Music, "assets/audio/music/Stage 1.mp3");
        this.load.audio(SoundKeys.SandTile, "assets/audio/sounds/sandTile.wav");
        this.load.audio(SoundKeys.LongJump, "assets/audio/sounds/longJump.mp3");
        this.load.audio(SoundKeys.LongJumpTrampoline, "assets/audio/sounds/longJumpTrampoline.mp3");
        this.load.audio(SoundKeys.ArrowShot, "assets/audio/sounds/arrowShot.mp3");
        this.load.audio(SoundKeys.Swoosh, "assets/audio/sounds/swoosh.mp3");
        this.load.audio(SoundKeys.JumpLanding, "assets/audio/sounds/jumpLanding.mp3");

        // Clouds.

        this.load.image(TextureKeys.Cloud1, `assets/images/clouds/Cloud1.png`);
        this.load.image(TextureKeys.Cloud2, `assets/images/clouds/Cloud2.png`);
        this.load.image(TextureKeys.Cloud3, `assets/images/clouds/Cloud3.png`);

        // Settings.

        this.load.image(TextureKeys.GearIconDefault, "assets/images/ui/GearIconDefault.png");
        this.load.image(TextureKeys.GearIconHovered, "assets/images/ui/GearIconHovered.png");
        this.load.image(TextureKeys.SettingsBodyBackground, "assets/images/ui/SettingsBodyBackground.png");
        this.load.image(TextureKeys.SettingsTitleBackground, "assets/images/ui/SettingsTitleBackground.png");
        this.load.image(TextureKeys.SettingsButtonDefault, "assets/images/ui/SettingsButtonDefault.png");
        this.load.image(TextureKeys.SettingsButtonHovered, "assets/images/ui/SettingsButtonHovered.png");
        this.load.image(TextureKeys.SoundIconDefault, "assets/images/ui/SoundIconDefault.png");
        this.load.image(TextureKeys.SoundIconHovered, "assets/images/ui/SoundIconHovered.png");
        this.load.image(TextureKeys.MusicIconDefault, "assets/images/ui/MusicIconDefault.png");
        this.load.image(TextureKeys.MusicIconHovered, "assets/images/ui/MusicIconHovered.png");
        this.load.image(TextureKeys.DisableIcon, "assets/images/ui/DisableIcon.png");
        this.load.image(TextureKeys.RepeatIcon, "assets/images/ui/RepeatIcon.png");

        // WelcomeScene.

        this.load.image(TextureKeys.TitleEn, "assets/images/ui/GameTitleEn.png");
        this.load.image(TextureKeys.TitleRu, "assets/images/ui/GameTitleRu.png");
        this.load.image(TextureKeys.EnglishFlagDefault, "assets/images/ui/EnglishFlagDefault.png");
        this.load.image(TextureKeys.EnglishFlagHovered, "assets/images/ui/EnglishFlagHovered.png");
        this.load.image(TextureKeys.RussianFlagDefault, "assets/images/ui/RussianFlagDefault.png");
        this.load.image(TextureKeys.RussianFlagHovered, "assets/images/ui/RussianFlagHovered.png");
        this.load.image(TextureKeys.StartButtonDefault, "assets/images/ui/StartButtonDefault.png");
        this.load.image(TextureKeys.StartButtonHovered, "assets/images/ui/StartButtonHovered.png");

        this.load.image(TextureKeys.Tiles, "assets/levels/tilesets/NoobParkourTileset.png");
        this.load.tilemapTiledJSON("map0", "assets/levels/maps/WelcomeScene.json");

        this.load.aseprite(AsepriteKeys.Noob, "assets/animations/NoobMain.png", "assets/animations/NoobMain.json");

        // LevelSelectionScene.

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

        // LevelScene.

        this.load.tilemapTiledJSON("map1", "assets/levels/maps/Level01.json");
        this.load.tilemapTiledJSON("map2", "assets/levels/maps/Level02.json");
        this.load.tilemapTiledJSON("map3", "assets/levels/maps/Level03.json");
        this.load.tilemapTiledJSON("map4", "assets/levels/maps/Level04.json");
        this.load.tilemapTiledJSON("map5", "assets/levels/maps/Level05.json");
        this.load.tilemapTiledJSON("map6", "assets/levels/maps/Level06.json");
        this.load.tilemapTiledJSON("map7", "assets/levels/maps/Level07.json");
        this.load.tilemapTiledJSON("map8", "assets/levels/maps/Level08.json");
        this.load.tilemapTiledJSON("map9", "assets/levels/maps/Level09.json");
        this.load.tilemapTiledJSON("map10", "assets/levels/maps/Level10.json");
        this.load.tilemapTiledJSON("map11", "assets/levels/maps/Level11.json");
        this.load.tilemapTiledJSON("map12", "assets/levels/maps/Level12.json");
        this.load.tilemapTiledJSON("map13", "assets/levels/maps/Level13.json");
        this.load.tilemapTiledJSON("map14", "assets/levels/maps/Level14.json");
        this.load.tilemapTiledJSON("map15", "assets/levels/maps/Level15.json");
        this.load.tilemapTiledJSON("map16", "assets/levels/maps/Level16.json");
        this.load.tilemapTiledJSON("map17", "assets/levels/maps/Level17.json");
        this.load.tilemapTiledJSON("map18", "assets/levels/maps/Level18.json");
        this.load.tilemapTiledJSON("map19", "assets/levels/maps/Level19.json");
        this.load.tilemapTiledJSON("map20", "assets/levels/maps/Level20.json");

        this.load.image(TextureKeys.Pixel, "assets/images/Pixel.png");
        this.load.glsl(ShaderKeys.Portal, "assets/shaders/Portal.frag");
        this.load.glsl(ShaderKeys.Lava, "assets/shaders/Lava.frag");

        this.load.image(TextureKeys.SignPostDefault, "assets/images/SignPostDefault.png");
        this.load.image(TextureKeys.SignPostHovered, "assets/images/SignPostHovered.png");
        this.load.image(TextureKeys.SandTile, "assets/images/SandTile.png");
        this.load.image(TextureKeys.JumpTile, "assets/images/JumpTile.png");
        this.load.image(TextureKeys.JumpTileHighlighted, "assets/images/JumpTileHighlighted.png");
        this.load.image(TextureKeys.SawBlades, "assets/images/SawBlades.png");
        this.load.image(TextureKeys.SawGrooveBody, "assets/images/SawGrooveBody.png");
        this.load.image(TextureKeys.SawGrooveHead, "assets/images/SawGrooveHead.png");
        this.load.image(TextureKeys.ArrowLeft, "assets/images/ArrowLeft.png");
        this.load.image(TextureKeys.ArrowRight, "assets/images/ArrowRight.png");
        this.load.image(TextureKeys.MovingPlatform, "assets/images/MovingPlatform.png");
        this.load.image(TextureKeys.SawBladesStatic, "assets/images/SawBladesStatic.png");
        this.load.image(TextureKeys.SawChain, "assets/images/SawChain.png");

        this.load.aseprite(AsepriteKeys.Coin, "assets/animations/Coin.png", "assets/animations/Coin.json");
        this.load.aseprite(AsepriteKeys.Trampoline, "assets/animations/Trampoline.png", "assets/animations/Trampoline.json");

        // LevelUIScene.

        this.load.image(TextureKeys.CoinUI, "assets/images/CoinUI_16x16.png");
        this.load.image(TextureKeys.HelpBoxBackground, "assets/images/ui/HelpBoxBackground.png");
        this.load.image(TextureKeys.LeftButtonDefault, "assets/images/ui/LeftButtonDefault.png");
        this.load.image(TextureKeys.LeftButtonHovered, "assets/images/ui/LeftButtonHovered.png");
        this.load.image(TextureKeys.RightButtonDefault, "assets/images/ui/RightButtonDefault.png");
        this.load.image(TextureKeys.RightButtonHovered, "assets/images/ui/RightButtonHovered.png");
        this.load.image(TextureKeys.UpButtonDefault, "assets/images/ui/UpButtonDefault.png");
        this.load.image(TextureKeys.UpButtonHovered, "assets/images/ui/UpButtonHovered.png");
        this.load.image(TextureKeys.SkipLevelButtonDefault, "assets/images/ui/SkipLevelButtonDefault.png");
        this.load.image(TextureKeys.SkipLevelButtonHovered, "assets/images/ui/SkipLevelButtonHovered.png");
        
        // AdScene.
        
        this.load.image(TextureKeys.Hand, "assets/images/ui/Hand.png");

        // Level complete screen.

        this.load.image(TextureKeys.BigStarEmpty, "assets/images/ui/BigStarEmpty.png");
        this.load.image(TextureKeys.BigStarFill, "assets/images/ui/BigStarFill.png");
        this.load.image(TextureKeys.NextButtonBackgroundDefault, "assets/images/ui/NextButtonBackgroundDefault.png");
        this.load.image(TextureKeys.NextButtonBackgroundHovered, "assets/images/ui/NextButtonBackgroundHovered.png");
        this.load.image(TextureKeys.NextIcon, "assets/images/ui/NextIcon.png");

        // Input controller.

        this.load.image(TextureKeys.LeftButtonDefault, "assets/images/ui/LeftButtonDefault.png");
        this.load.image(TextureKeys.LeftButtonHovered, "assets/images/ui/LeftButtonHovered.png");
        this.load.image(TextureKeys.RightButtonDefault, "assets/images/ui/RightButtonDefault.png");
        this.load.image(TextureKeys.RightButtonHovered, "assets/images/ui/RightButtonHovered.png");
        this.load.image(TextureKeys.UpButtonDefault, "assets/images/ui/UpButtonDefault.png");
        this.load.image(TextureKeys.UpButtonHovered, "assets/images/ui/UpButtonHovered.png");
    }

    override create() : void {
        this.createAnimations();

        bridge.platform.sendMessage(instantGamesBridge.PLATFORM_MESSAGE.GAME_READY);

        this.scene.launch(SceneKeys.Ad);

        if (development && typeof debugConfig !== "undefined") {
            if (debugConfig.clearLocalStorage) {
                Prefs.clear();
            }

            if (debugConfig.openAllLevels) {
                Progress.setLevelCompleted(MaxLevels);
            }

            if (debugConfig.startLevelScene) {
                this.scene.start(SceneKeys.Level, { level: debugConfig.levelSceneLevel ?? 1 });
                this.scene.launch(SceneKeys.LevelUI);
                return;
            }
        }
        
        this.scene.start(SceneKeys.Welcome);
    }

    private createAnimations() : void {
        this.anims.createFromAseprite(AsepriteKeys.Trampoline);
        this.anims.createFromAseprite(AsepriteKeys.Noob);
    }
}