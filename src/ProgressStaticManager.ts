class ProgressStaticManager {
    public isLevelCompleted(level: number) : boolean {
        return false;
    }

    public setLevelCompleted(level: number, value:boolean = true) {
        
    }
}

export let Progress = new ProgressStaticManager();