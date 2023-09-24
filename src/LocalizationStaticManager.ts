export enum Language {
    Russian = "ru", 
    English = "en"
}

const LanguageStorageKey = "current_language";

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
            en: "Main Menu",
            ru: "В главное меню"
        };
    }

    public get wasLanguagePreviouslySelected() : boolean {
        return localStorage.getItem(LanguageStorageKey) !== null;
    }

    public get currentLanguage() : Language {
        var language = localStorage.getItem(LanguageStorageKey);

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
            localStorage.setItem(LanguageStorageKey, language);
        } else {
            localStorage.setItem(LanguageStorageKey, "en");
        }
    }

    public getText(key:LocalizationKey) {
        return this.localizationTexts[key][this.currentLanguage];
    }
}

export let Localization = new LocalizationStaticManager();