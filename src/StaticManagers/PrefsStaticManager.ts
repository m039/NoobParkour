const LanguageStorageKey = "current_language";
const SoundEnabledKey = "sound_enabled";
const MusicEnabledKey = "music_enabled";

class PrefsStaticManager {
    private languageCode : string | null;
    private soundEnabled : boolean;
    private musicEnabled : boolean;
    private useLocalStorage : boolean;

    public load() {
        this.useLocalStorage = this.isLocalStorageAvailable();
        this.languageCode = this.getItem(LanguageStorageKey, null);
        this.soundEnabled = this.getItem(SoundEnabledKey, "true") === "true";
        this.musicEnabled = this.getItem(MusicEnabledKey, "true") === "true";
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