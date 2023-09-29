const LanguageStorageKey = "current_language";
const SoundEnabledKey = "sound_enabled";
const MusicEnabledKey = "music_enabled";
const CompletedLevelKey = "completed_level";
const StarLevelsKey = "star_levels";

class PrefsStaticManager {
    private languageCode : string | null;
    private soundEnabled : boolean;
    private musicEnabled : boolean;
    private useLocalStorage : boolean;
    private completedLevel : number;
    private starLevels : Array<number>

    public load() {
        this.useLocalStorage = this.isLocalStorageAvailable();
        this.languageCode = this.getItem(LanguageStorageKey, null);
        this.soundEnabled = this.getItem(SoundEnabledKey, "true") === "true";
        this.musicEnabled = this.getItem(MusicEnabledKey, "true") === "true";
        this.completedLevel = JSON.parse(this.getItem(CompletedLevelKey, "0"));
        this.starLevels = JSON.parse(this.getItem(StarLevelsKey, "[]"));
    }

    public clear() {
        if (this.isLocalStorageAvailable()) {
            localStorage.clear();
        }
    }

    public getCompletedLevel() : number {
        return this.completedLevel;
    }

    public setCompletedLevel(completedLevel:number) {
        this.completedLevel = completedLevel;
        this.setItem(CompletedLevelKey, JSON.stringify(this.completedLevel));
    }

    public getStarLevels() : Array<number> {
        return this.starLevels;
    }

    public setStarLevels(starLevels: Array<number>) {
        this.starLevels = starLevels;
        this.setItem(StarLevelsKey, JSON.stringify(this.starLevels));
    }

    public getMusicEnabled() : boolean {
        return this.musicEnabled;
    }

    public setMusicEnabled(enabled:boolean) {
        this.musicEnabled = enabled;
        this.setItem(MusicEnabledKey, new Boolean(this.musicEnabled).toString());
    }

    public getSoundEnabled() : boolean {
        return this.soundEnabled;
    }

    public setSoundEnabled(enabled:boolean) {
        this.soundEnabled = enabled;
        this.setItem(SoundEnabledKey, new Boolean(this.soundEnabled).toString());
    }

    public getLanguageCode() : string | null {
        return this.languageCode;
    }

    public setLanguageCode(languageCode : string) {
        this.languageCode = languageCode;
        this.setItem(LanguageStorageKey, languageCode);
    }

    private setItem(key:string, value:string) {
        if (this.useLocalStorage) {
            localStorage.setItem(key, value);
        }
    }

    private getItem(key:string, defaultValue: string) : string | null {
        if (this.useLocalStorage) {
            const value = localStorage.getItem(key);
            if (value === null) {
                return defaultValue;
            } else {
                return value;
            }
        } else {
            return defaultValue;
        }
    }

    private isLocalStorageAvailable() : boolean {
        try {
            var storage = window["localStorage"],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return false;
        }
    }
}

export let Prefs = new PrefsStaticManager();