import * as Phaser from 'phaser';
import AudioManager from './AudioManager';

export interface GameManager {
    preload(): void;
    create(): void;
    update(time: number, delta: number): void;
}

export default abstract class GameLevel extends Phaser.Scene {
    public audioManager : AudioManager;

    private gameManagers : Array<GameManager>;

    constructor() {
        super();

        this.audioManager = new AudioManager(this);
        this.gameManagers = [this.audioManager];
    }

    public preload(): void {
        for (var gm of this.gameManagers) {
            gm.preload();
        }
    }

    public create(): void {
        for (var gm of this.gameManagers) {
            gm.create();
        }
    }

    public update(time: number, delta: number): void {
        for (var gm of this.gameManagers) {
            gm.update(time, delta);
        }
    }
}