import * as Phaser from 'phaser';
import { Language, Localization } from './LocalizationStaticManager';
import CloudManager from './CloudManager';

class FlagButton {
    private welcomeScene:WelcomeScene;
    private image:Phaser.GameObjects.Image;
    private defaultTexture:string;
    private hoveredTexture:string;
    private language:Language;
    private selected:boolean;

    constructor(
        welcomeScene:WelcomeScene,
        x:number, 
        y:number, 
        defaultTexture:string, 
        hoveredTexture:string,
        language:Language) {
        this.welcomeScene = welcomeScene;
        this.image = welcomeScene.add.image(x, y, defaultTexture);
        this.defaultTexture = defaultTexture;
        this.hoveredTexture = hoveredTexture;
        this.language = language;
        this.selected = false;
        this.constructButton();
    }

    private constructButton() {
        this.image.setInteractive();
        this.image.on("pointerover", () => {
            this.image.setTexture(this.hoveredTexture);
        });
        this.image.on("pointerout", () => {
            if (!this.selected) {
                this.image.setTexture(this.defaultTexture);
            }
        });
        this.image.on("pointerup", () => {
            this.welcomeScene.setLanguage(this.language);
        });
    }

    public setSelected(selected:boolean) {
        this.selected = selected;
        this.image.setTexture(selected?this.hoveredTexture:this.defaultTexture);
    }
}

export default class WelcomeScene extends Phaser.Scene {
    private title : Phaser.GameObjects.Image;
    private russianFlag : FlagButton;
    private englishFlag : FlagButton;
    private cloudManager : CloudManager;

    constructor() {
        super({ key:"WelcomeScene" });
        this.cloudManager = new CloudManager(this, {count: 15, bounds: new Phaser.Geom.Rectangle(-40, 0, 480+80, 270)});
    }

    preload() {
        this.cloudManager.preload();
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
    }

    create() {
        this.cloudManager.create();

        this.cameras.main.setZoom(4, 4);
        this.cameras.main.setOrigin(0, 0);
        this.cameras.main.setPosition(0, 0);

        const map = this.make.tilemap({ key: "map"});
        const tileset = map.addTilesetImage("NoobParkourTileset", "tiles", 16, 16);
        const groundLayer = map.createLayer("Ground", tileset, -200, -20);
        groundLayer.setSkipCull(true);

        this.anims.createFromAseprite("noob");
        const noob = this.add.sprite(127, 227, "noob");
        noob.play({key:"Sit", repeat: -1});

        this.title = this.add.image(240, 100, "title_ru");
        const startButton = this.add.image(240, 205, "start_button_default");
        this.constructButton(startButton, "start_button_default", "start_button_hovered");

        startButton.setRotation(-0.08);
        this.tweens.add({
            targets: startButton,
            rotation: 0.08,
            duration: 1500,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true
        });

        this.englishFlag = new FlagButton(
            this, 
            480 - 56, 
            270 - 20, 
            "english_flag_default", 
            "english_flag_hovered", 
            Language.English
        );

        this.russianFlag = new FlagButton(
            this,
            480 - 25, 
            270 - 20,
            "russian_flag_default",
            "russian_flag_hovered",
            Language.Russian
        );
        
        if (Localization.currentLanguage === undefined) {
            Localization.currentLanguage = bridge.platform.language;
        }

        this.setLanguage(Localization.currentLanguage);
    }

    update(time: number, delta: number): void {
        this.cloudManager.update(time, delta);
    }

    private constructButton(
        image:Phaser.GameObjects.Image, 
        defaultTexture:string, 
        hoveredTexture:string) : void {
        image.setInteractive();
        image.on("pointerover", () => {
            image.setTexture(hoveredTexture);
        });
        image.on("pointerout", () => {
            image.setTexture(defaultTexture);
        })
    }

    public setLanguage(language : Language) {
        switch (language) {
            case Language.Russian:
                this.title.setTexture("title_ru");
                this.russianFlag.setSelected(true);
                this.englishFlag.setSelected(false);
                break;
            default:
            case Language.English:
                this.title.setTexture("title_en");
                this.russianFlag.setSelected(false);
                this.englishFlag.setSelected(true);
                break;
        }
        Localization.currentLanguage = language;
    }
}