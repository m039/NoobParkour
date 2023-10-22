import { Prefs } from "./PrefsStaticManager";

export enum Language {
    Russian = "ru", 
    English = "en"
}

export enum LocalizationKey {
    SelectLevelTitle = "select_level_title",
    SettingsTitle = "settings_title",
    LevelCompleTitle = "level_complete_title",
    Back = "back",
    SettingsMenuButton = "settings_menu_button",
    MenuRestartLevel = "menu_repeat_level",
    NextLevel = "next_level",
    Reset = "reset",
    Tutorial1Desktop = "tutorial1_desktop",
    Tutorial2Desktop = "tutorial2_desktop",
    Tutorial1Mobile = "tutorial1_mobile",
    Tutorial2Mobile = "tutorial2_mobile",
    Tutorial3 = "tutorial3",
    Tutorial4 = "tutorial4",
    Tutorial5 = "tutorial5",
    Tutorial6 = "tutorial6",
    Tutorial7 = "tutorial7",
    Tutorial8 = "tutorial8",
    Tutorial9 = "tutorial9",
    Tutorial10 = "tutorial10",
    Tutorial11 = "tutorial11",
    Tutorial12 = "tutorial12",
    Tutorial13 = "tutorial13",
    Tutorial14 = "tutorial14"
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
            ru: "Нажмите A или D, чтобы двигаться.\nИли используйте клавиши со стрелками."
        };
        this.localizationTexts[LocalizationKey.Tutorial2Desktop] = {
            en: "Press W or up to jump.",
            ru: "Нажмите W или вверх, чтобы прыгнуть."
        };
        this.localizationTexts[LocalizationKey.Tutorial1Mobile] = {
            en: "Press buttons in the left bottom\ncorner to move.",
            ru: "Нажмите на клавиши в левом углу\nэкрана, чтобы двигаться."
        };
        this.localizationTexts[LocalizationKey.Tutorial2Mobile] = {
            en: "Press button in the right bottom\ncorner to jump.",
            ru: "Нажмите на клавишу в правом углу\nэкрана, чтобы прыгнуть."
        };
        this.localizationTexts[LocalizationKey.LevelCompleTitle] = {
            en: "Level\nCompleted",
            ru: "Уровень\nпройден"
        };
        this.localizationTexts[LocalizationKey.Tutorial3] = {
            en: "Collect coins.",
            ru: "Собирайте монетки."
        };
        this.localizationTexts[LocalizationKey.Tutorial4] = {
            en: "Beware of lava!",
            ru: "Осторожно, лава!"
        };
        this.localizationTexts[LocalizationKey.Tutorial5] = {
            en: "Use wall jump to reach higher\nplace!",
            ru: "Отпрыгивайте от стены, чтобы забраться\nвыше!"
        };
        this.localizationTexts[LocalizationKey.Tutorial6] = {
            en: "Press jump while in the air!",
            ru: "Нажмите прыжок, когда находитесь\nв воздухе!"
        };
        this.localizationTexts[LocalizationKey.Tutorial7] = {
            en: "The spikes are sharp!",
            ru: "Шипы острые!"
        };
        this.localizationTexts[LocalizationKey.Tutorial8] = {
            en: "Press up key quickly to jump low!",
            ru: "Нажимайте кнопку вверх быстро,\n чтобы прыгнуть низко!"
        };
        this.localizationTexts[LocalizationKey.MenuRestartLevel] = {
            en: "Restart Level",
            ru: "Начать заново"
        };
        this.localizationTexts[LocalizationKey.NextLevel] = {
            en: "Next Level",
            ru: "Следующий ур."
        };
        this.localizationTexts[LocalizationKey.Tutorial9] = {
            en: "Don't stay too long on the sand.",
            ru: "Не стойте долго на песке."
        };
        this.localizationTexts[LocalizationKey.Tutorial10] = {
            en: "Jump higher with green platforms.",
            ru: "Прыгайте выше с помощью зеленых платформ."
        };
        this.localizationTexts[LocalizationKey.Tutorial11] = {
            en: "Jump on the trampoline.",
            ru: "Прыгайте на трамплин."
        };
        this.localizationTexts[LocalizationKey.Tutorial12] = {
            en: "Wait for it and hop in.",
            ru: "Подождите и запрыгивайте."
        };
        this.localizationTexts[LocalizationKey.Tutorial13] = {
            en: "Hello, saws!",
            ru: "Привет, пилы!"
        };
        this.localizationTexts[LocalizationKey.Tutorial14] = {
            en: "Careful, these statues shot arrows!",
            ru: "Осторожно, эти статуи стреляют стрелами!"
        };
        this.localizationTexts[LocalizationKey.Reset] = {
            en: "Reset Progress",
            ru: "Сброс прогресса"
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

    public getText(key:LocalizationKey) : string {
        if (key in this.localizationTexts) {
            return this.localizationTexts[key][this.currentLanguage];
        } else {
            return null;
        }
    }
}

export let Localization = new LocalizationStaticManager();