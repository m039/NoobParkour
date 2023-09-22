class ProgressStaticManager {
    public isLevelCompletedFully(level: number) : boolean {
        if (level == 1) {
            return true;
        } else {
            return false;
        }
    }

    public setLevelCompletedFully(level: number, value: boolean = true) {
    }

    public isLevelOpen(level: number) : boolean {
        if (level <= 2) {
            return true;
        } else {
            return false;
        }
    }

    public isLevelCompleted(level: number) : boolean {
        if (level == 1) {
            return true;
        } else {
            return false;
        }
    }

    public setLevelCompleted(level: number, value: boolean = true) {
    }
}

export let Progress = new ProgressStaticManager();