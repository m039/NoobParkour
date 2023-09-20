import * as Phaser from 'phaser';
import { Language, Localization } from './LocalizationStaticManager';

export default class WelcomeScene extends Phaser.Scene {
    private title : Phaser.GameObjects.Image;

    constructor() {
        super({ key:"WelcomeScene" });
    }

    preload() {
        this.load.image("title_en", "assets/images/ui/GameTitleEn.png");
        this.load.image("title_ru", "assets/images/ui/GameTitleRu.png");
        this.load.image("english_flag_default", "assets/images/ui/EnglishFlagDefault.png");
        this.load.image("english_flag_hovered", "assets/images/ui/EnglishFlagHovered.png");
        this.load.image("russian_flag_default", "assets/images/ui/RussianFlagDefault.png");
        this.load.image("russian_flag_hovered", "assets/images/ui/RussianFlagHovered.png");
        this.load.image("start_button_default", "assets/images/ui/StartButtonDefault.png");
        this.load.image("start_button_hovered", "assets/images/ui/StartButtonHovered.png");
    }

    create() {
        Localization.currentLanguage = bridge.platform.language;

        this.cameras.main.setZoom(4, 4);
        this.cameras.main.setOrigin(0, 0);
        this.cameras.main.setPosition(0, 0);

        this.title = this.add.image(240, 100, "title_ru");
        const startButton = this.add.image(240, 205, "start_button_default");
        this.constructButton(startButton, "start_button_default", "start_button_hovered");
        
        const englishFlag = this.add.image(480 - 56, 270 - 20, "english_flag_default");
        const russianFlag = this.add.image(480 - 25, 270 - 20, "russian_flag_default");

        this.constructButton(englishFlag, "english_flag_default", "english_flag_hovered");
        this.constructButton(russianFlag, "russian_flag_default", "russian_flag_hovered");

        this.updateLanguage(Localization.currentLanguage);
    }

    private constructButton(image:Phaser.GameObjects.Image, defaultTexture:string, hoveredTexture:string) : void {
        image.setInteractive();
        image.on("pointerover", () => {
            image.setTexture(hoveredTexture);
        });
        image.on("pointerout", () => {
            image.setTexture(defaultTexture);
        })
    }

    private updateLanguage(language : Language) {
        switch (language) {
            case Language.Russian:
                this.title.setTexture("title_ru");
                break;
            default:
            case Language.English:
                this.title.setTexture("title_en");
                break;
        }
    }
}