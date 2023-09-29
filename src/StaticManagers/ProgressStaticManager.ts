import { Prefs } from "./PrefsStaticManager";

class ProgressStaticManager {
    public isLevelCompletedFully(level: number) : boolean {
        return Prefs.getStarLevels().find(o => o == level) !== undefined;
    }

    public setLevelCompletedFully(level: number) {
        const starLevels = Prefs.getStarLevels();

        if (starLevels.find(o => o == level) === undefined) {
            starLevels.push(level);
            Prefs.setStarLevels(starLevels);
        }
    }

    public isLevelOpen(level: number) : boolean {
        if (level <= 1 || level <= Prefs.getCompletedLevel() + 1) {
            return true;
        } else {
            return false;
        }
    }

    public isLevelCompleted(level: number) : boolean {
        if (level <= Prefs.getCompletedLevel()) {
            return true;
        } else {
            return false;
        }
    }

    public setLevelCompleted(level: number) {
        const completedLevel = Prefs.getCompletedLevel();

        if (completedLevel < level) {
            Prefs.setCompletedLevel(level);
        }
    }
}

export let Progress = new ProgressStaticManager();