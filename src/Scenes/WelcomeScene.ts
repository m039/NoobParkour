import * as Phaser from 'phaser';
import { Language, Localization } from '../StaticManagers/LocalizationStaticManager';
import CloudManager from '../Managers/CloudManager';
import { GameHeight, GameWidth } from '../Consts/Consts';
import BaseScene from './BaseScene';
import SettingsManager from '../Managers/SettingsManager';
import { createButton } from '../Utils';
import TextureKeys from '../Consts/TextureKeys';
import SceneKeys from '../Consts/SceneKeys';
import EventKeys from '../Consts/EventKeys';
import AudioScene from './AudioScene';
import { MusicId } from '../Managers/AudioManager';
import AsepriteKeys from 'src/Consts/AsepriteKeys';

class FlagButton {
    private welcomeScene:WelcomeScene;
    private image:Phaser.GameObjects.Image;
    private defaultTexture:TextureKeys;
    private hoveredTexture:TextureKeys;
    private language:Language;
    private selected:boolean;

    constructor(
        welcomeScene:WelcomeScene,
        x:number, 
        y:number, 
        defaultTexture:TextureKeys, 
        hoveredTexture:TextureKeys,
        language:Language
    ) {
        this.welcomeScene = welcomeScene;
        this.image = welcomeScene.add.image(x, y, defaultTexture);
        this.defaultTexture = defaultTexture;
        this.hoveredTexture = hoveredTexture;
        this.language = language;
        this.selected = false;

        createButton(this.image, {
            defaultTexture: this.defaultTexture,
            hoveredTexture: this.hoveredTexture,
            onClick: () => {this.welcomeScene.setLanguage(this.language);},
            isSelected: () => this.selected
        });
    }

    public setSelected(selected:boolean) {
        this.selected = selected;
        this.image.setTexture(selected?this.hoveredTexture:this.defaultTexture);
    }
}

export default class WelcomeScene extends BaseScene {
    private title : Phaser.GameObjects.Image;
    private russianFlag : FlagButton;
    private englishFlag : FlagButton;

    constructor() {
        super({ key: SceneKeys.Welcome });
        this.gameManagers.push(
            new CloudManager(this, {count: 15, bounds: new Phaser.Geom.Rectangle(-40, 0, GameWidth+80, GameHeight)}),
            new SettingsManager(this)
        );
    }

    override create() {
        (this.scene.get(SceneKeys.Audio) as AudioScene).audioManager.playMusic(MusicId.Menu);

        super.create();

        this.cameras.main.setZoom(4, 4).setOrigin(0, 0).setPosition(0, 0);

        const map = this.make.tilemap({ key: "map0"});
        const tileset = map.addTilesetImage("NoobParkourTileset", TextureKeys.Tiles, 16, 16, 1, 2);
        const groundLayer = map.createLayer("Ground", tileset, -200, -20);
        groundLayer.setSkipCull(true);

        const noob = this.add.sprite(127, 227, AsepriteKeys.Noob);
        noob.play({key:"Sit", repeat: -1});

        this.title = this.add.image(240, 100, TextureKeys.TitleRu);
        this.constructStartButton();

        this.englishFlag = new FlagButton(
            this, 
            GameWidth - 56, 
            GameHeight - 20, 
            TextureKeys.EnglishFlagDefault, 
            TextureKeys.EnglishFlagHovered, 
            Language.English
        );

        this.russianFlag = new FlagButton(
            this,
            GameWidth - 25, 
            GameHeight - 20,
            TextureKeys.RussianFlagDefault,
            TextureKeys.RussianFlagHovered,
            Language.Russian
        );
        
        if (!Localization.wasLanguagePreviouslySelected) {
            Localization.currentLanguage = bridge.platform.language;
        }

        this.setLanguage(Localization.currentLanguage);
    }

    private constructStartButton() : void {
        const startButton = this.add.image(240, 205, TextureKeys.StartButtonDefault);

        createButton(startButton, {
            defaultTexture: TextureKeys.StartButtonDefault,
            hoveredTexture: TextureKeys.StartButtonHovered,
            onClick: () => { this.scene.start(SceneKeys.LevelSelection); }
        })

        startButton.setRotation(-0.08);
        this.tweens.add({
            targets: startButton,
            rotation: 0.08,
            duration: 1500,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true
        });
    }

    public setLanguage(language : Language) {
        switch (language) {
            case Language.Russian:
                this.title.setTexture(TextureKeys.TitleRu);
                this.russianFlag.setSelected(true);
                this.englishFlag.setSelected(false);
                break;
            default:
            case Language.English:
                this.title.setTexture(TextureKeys.TitleEn);
                this.russianFlag.setSelected(false);
                this.englishFlag.setSelected(true);
                break;
        }
        Localization.currentLanguage = language;
        this.events.emit(EventKeys.LanguageSelected);
    }
}