export enum MetrikaEvent {
    FIRST_INTERSTITIAL = "first_interstitial"
}

class MetrikaStaticManager {
    reachGoal(event:MetrikaEvent | string) : void {
        ym(95231871, 'reachGoal', event);
    }
}

export let Metrika = new MetrikaStaticManager();