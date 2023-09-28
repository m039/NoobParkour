import { Prefs } from "./PrefsStaticManager";

export enum Language {
    Russian = "ru", 
    English = "en"
}

export enum LocalizationKey {
    SelectLevelTitle = "select_level_title",
    SettingsTitle = "settings_title",
    Back = "back",
    SettingsMenuButton = "settings_menu_button",
    Tutorial1Desktop = "tutorial1_desktop",
    Tutorial2Desktop = "tutorial2_desktop"
};

class LocalizationStaticManager {

    private localizationTexts : {[key:string] : {en:string, ru:string}};

    constructor() {
        this.localizationTexts = {};
        this.localizationTexts[LocalizationKey.SelectLevelTitle] = {
            en: "Select Level",
            ru: "Выберите уровень"
        };
        this.localizationTexts[LocalizationKey.SettingsTitle] = {
            en: "Settings",
            ru: "Настройки"
        };
        this.localizationTexts[LocalizationKey.Back] = {
            en: "Back",
            ru: "Назад"
        };
        this.localizationTexts[LocalizationKey.SettingsMenuButton] = {
            en: "Start Screen",
            ru: "В начальный экран"
        };
        this.localizationTexts[LocalizationKey.Tutorial1Desktop] = {
            en: "Press A or D to move.\nOr use left or right arrow keys.",
            ru: "Нажмите A или D, чтобы двигаться.\nИли используйте клавиши со стрелочками."
        };
        this.localizationTexts[LocalizationKey.Tutorial2Desktop] = {
            en: "Press space or up to jump.",
            ru: "Нажмите пробел или вверх, чтобы прыгнуть."
        };
    }

    public get wasLanguagePreviouslySelected() : boolean {
        return Prefs.getLanguageCode() !== null;
    }

    public get currentLanguage() : Language {
        var language = Prefs.getLanguageCode();

        if (language === "en") {
            return Language.English;
        } else if (language === "ru") {
            return Language.Russian;
        } else {
            return Language.English;
        }
    }

    public set currentLanguage(language : Language | string) {
        if (typeof language !== 'string') {
            switch (language) {
                case Language.Russian:
                    language = "ru";
                    break;
                default:
                case Language.English:
                    language = "en";
                    break;
            }
        }
        
        if (language === "ru" || language === "en") {
            Prefs.setLanguageCode(language);
        } else {
            Prefs.setLanguageCode("en");
        }
    }

    public getText(key:LocalizationKey) {
        return this.localizationTexts[key][this.currentLanguage];
    }
}

export let Localization = new LocalizationStaticManager();