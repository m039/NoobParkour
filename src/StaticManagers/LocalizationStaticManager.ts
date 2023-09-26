import { Prefs } from "./PrefsStaticManager";

export enum Language {
    Russian = "ru", 
    English = "en"
}

export enum LocalizationKey {
    SelectLevelTitle = "select_level_title",
    SettingsTitle = "settings_title",
    Back = "back",
    SettingsMenuButton = "settings_menu_button"
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