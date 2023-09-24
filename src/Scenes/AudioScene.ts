import SceneKeys from "../Consts/SceneKeys";
import AudioManager from "../Managers/AudioManager";
import BaseScene from "./BaseScene";

export default class AudioScene extends BaseScene {

    public audioManager:AudioManager;

    constructor() {
        super({key:SceneKeys.Audio, active: true});

        this.audioManager = new AudioManager(this);
        this.gameManagers.push(this.audioManager);
    }
}