import * as Phaser from 'phaser';

export interface GameManager {
    preload(): void;
    create(): void;
    update(time: number, delta: number): void;
}

export default abstract class BaseScene extends Phaser.Scene {
    public gameManagers : Array<GameManager>;

    constructor(config? : string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);

        this.gameManagers = [];
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