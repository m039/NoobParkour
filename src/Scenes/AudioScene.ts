import SceneKeys from "../Consts/SceneKeys";
import AudioManager from "../Managers/AudioManager";
import BaseScene from "./BaseScene";
import LevelScene from "./LevelScene";

export default class AudioScene extends BaseScene {

    public audioManager:AudioManager;

    private wasMusicEnabled : boolean;

    private wasLevelSceneRunning : boolean;

    constructor() {
        super({key:SceneKeys.Audio, active: true});

        this.audioManager = new AudioManager(this);
        this.gameManagers.push(this.audioManager);

        const self = this;

        bridge.advertisement.on(
            instantGamesBridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, 
            function (state) {
                if (state === instantGamesBridge.INTERSTITIAL_STATE.OPENED) {
                    self.wasMusicEnabled = self.audioManager.musicEnabled;
                    self.audioManager.musicEnabled = false;
                    self.wasLevelSceneRunning = self.scene.isActive(SceneKeys.Level);
                    self.scene.pause(SceneKeys.Level);
                } else if (state === instantGamesBridge.INTERSTITIAL_STATE.CLOSED || 
                    state === instantGamesBridge.INTERSTITIAL_STATE.FAILED) {
                    self.audioManager.musicEnabled = self.wasMusicEnabled;
                    if (self.wasLevelSceneRunning) {
                        self.scene.resume(SceneKeys.Level);
                    }
                }
            }
        );
    }

    onInterstitialStateChanged(state : string) {
        if (state === instantGamesBridge.INTERSTITIAL_STATE.OPENED) {
            this.wasMusicEnabled = this.audioManager.musicEnabled;
            this.audioManager.musicEnabled = false;
        } else if (state === instantGamesBridge.INTERSTITIAL_STATE.CLOSED || 
            state === instantGamesBridge.INTERSTITIAL_STATE.FAILED) {
            this.audioManager.musicEnabled = this.wasMusicEnabled;
        }
    }
}