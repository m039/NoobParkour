export enum Language {
    Russian = "ru", 
    English = "en"
}

const LanguageStorageKey = "current_language";

class LocalizationStaticManager {

    private _currentLanguage : Language;

    public get currentLanguage() : Language | undefined {
        var language = localStorage.getItem(LanguageStorageKey);

        if (language === "en") {
            return Language.English;
        } else if (language === "ru") {
            return Language.Russian;
        } else {
            return undefined;
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
}

export let Localization = new LocalizationStaticManager();