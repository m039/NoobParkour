import SceneKeys from "../Consts/SceneKeys";
import AudioManager from "../Managers/AudioManager";
import BaseScene from "./BaseScene";
import LevelScene from "./LevelScene";

export default class AudioScene extends BaseScene {

    public audioManager:AudioManager;

    private wasMusicEnabled : boolean;

    private wasSoundEnabled : boolean;

    private wasLevelSceneRunning : boolean;

    constructor() {
        super({key:SceneKeys.Audio, active: true});

        this.audioManager = new AudioManager(this);
        this.gameManagers.push(this.audioManager);
    }

    public create(): void {
        super.create();

        const self = this;

        bridge.advertisement.on(
            instantGamesBridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, 
            function (state) {
                if (state === instantGamesBridge.INTERSTITIAL_STATE.OPENED) {
                    self.audioManager.disable();
                    self.wasLevelSceneRunning = self.scene.isActive(SceneKeys.Level);
                    if (self.wasLevelSceneRunning) {
                        self.scene.pause(SceneKeys.Level);
                    }
                } else if (state === instantGamesBridge.INTERSTITIAL_STATE.CLOSED || 
                    state === instantGamesBridge.INTERSTITIAL_STATE.FAILED) {
                    self.audioManager.enable();
                    if (self.wasLevelSceneRunning) {
                        self.scene.resume(SceneKeys.Level);
                    }
                }
            }
        );
    }
}