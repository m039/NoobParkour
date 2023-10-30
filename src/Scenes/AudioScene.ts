import { Metrika, MetrikaEvent } from "src/StaticManagers/MetrikaStaticManager";
import SceneKeys from "../Consts/SceneKeys";
import AudioManager from "../Managers/AudioManager";
import BaseScene from "./BaseScene";
import LevelScene from "./LevelScene";
import { Progress } from "src/StaticManagers/ProgressStaticManager";
import { Prefs } from "src/StaticManagers/PrefsStaticManager";
import AdScene from "./AdScene";

export default class AudioScene extends BaseScene {

    public audioManager:AudioManager;

    private wasLevelSceneRunning : boolean;

    constructor() {
        super({key:SceneKeys.Audio, active: true});

        this.audioManager = new AudioManager(this);
        this.gameManagers.push(this.audioManager);
    }

    public create(): void {
        super.create();

        const self = this;

        let firstInterstitial = false;

        let adIsOpen = false;

        bridge.advertisement.on(
            instantGamesBridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, 
            function (state) {
                if (state === instantGamesBridge.INTERSTITIAL_STATE.OPENED) {
                    if (!firstInterstitial) {
                        Metrika.reachGoal(MetrikaEvent.FIRST_INTERSTITIAL);
                        firstInterstitial = true;
                    }

                    self.audioManager.disable();
                    self.wasLevelSceneRunning = self.scene.isActive(SceneKeys.Level);
                    if (self.wasLevelSceneRunning) {
                        self.scene.pause(SceneKeys.Level);
                    }
                    adIsOpen = true;
                } else if (state === instantGamesBridge.INTERSTITIAL_STATE.CLOSED || 
                    state === instantGamesBridge.INTERSTITIAL_STATE.FAILED) {
                    adIsOpen = false;

                    const adScene = self.scene.get(SceneKeys.Ad) as AdScene;
                    if (adScene.visible) {
                        return;
                    }
                    
                    self.audioManager.enable();
                    if (self.wasLevelSceneRunning) {
                        self.scene.resume(SceneKeys.Level);
                    }
                }
            }
        );

        bridge.advertisement.on(
            instantGamesBridge.EVENT_NAME.REWARDED_STATE_CHANGED, 
            function (state) {
                if (state === instantGamesBridge.REWARDED_STATE.OPENED) {
                    Metrika.reachGoal("show_rewarded");

                    self.audioManager.disable();
                    self.wasLevelSceneRunning = self.scene.isActive(SceneKeys.Level);
                    if (self.wasLevelSceneRunning) {
                        self.scene.pause(SceneKeys.Level);
                    }
                    adIsOpen = true;
                } else if (state === instantGamesBridge.REWARDED_STATE.CLOSED || 
                    state === instantGamesBridge.REWARDED_STATE.FAILED) {
                    adIsOpen = false;

                    const adScene = self.scene.get(SceneKeys.Ad) as AdScene;
                    if (adScene.visible) {
                        return;
                    }

                    self.audioManager.enable();
                    if (self.wasLevelSceneRunning) {
                        self.scene.resume(SceneKeys.Level);
                    }
                } else if (state == instantGamesBridge.REWARDED_STATE.REWARDED) {
                    const levelScene = self.scene.get(SceneKeys.Level) as LevelScene;
                    Progress.setLevelCompleted(levelScene.level);
                    Prefs.syncToCloud();

                    levelScene.scene.restart({level: levelScene.level + 1});
                    self.scene.pause(SceneKeys.Level);

                    const levelUIScene = self.scene.get(SceneKeys.LevelUI);
                    levelUIScene.scene.restart();
                }
            }
        );

        bridge.game.on(instantGamesBridge.EVENT_NAME.VISIBILITY_STATE_CHANGED, 
            function (state) {
                const adScene = self.scene.get(SceneKeys.Ad) as AdScene;
                if (adScene.visible) {
                    return;
                }

                if (state === instantGamesBridge.VISIBILITY_STATE.HIDDEN) {
                    self.audioManager.disable();
                } else if (state === instantGamesBridge.VISIBILITY_STATE.VISIBLE) {
                    if (!adIsOpen) {
                        self.audioManager.enable();
                    }
                }
            }
        );
    }
}