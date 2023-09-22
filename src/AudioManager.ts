import * as Phaser from 'phaser';
import GameLevel, { GameManager } from './GameLevel';
import { getRandomElement } from './Utils';

export enum SoundId {
    Jump,
    PickUpCoin,
    Loose,
    Blip
}

export default class AudioManager implements GameManager {
    private scene : Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    preload(): void {
        this.scene.load.audio("jump1", "assets/audio/jump1.wav");
        this.scene.load.audio("jump2", "assets/audio/jump2.ogg");
        this.scene.load.audio("coin1", "assets/audio/coin1.wav");
        this.scene.load.audio("loose1", "assets/audio/loose1.wav");
        this.scene.load.audio("blip1", "assets/audio/blipSelect1.wav");
        this.scene.load.audio("blip2", "assets/audio/blipSelect2.wav");
    }

    create(): void {
        
    }

    update(time: number, delta: number): void {
        
    }

    public play(soundId: SoundId) {
        switch (soundId) {
            case SoundId.Jump:
                this.scene.sound.play(getRandomElement(["jump2"]));
                break;
            case SoundId.PickUpCoin:
                this.scene.sound.play("coin1");
                break;
            case SoundId.Loose:
                this.scene.sound.play("loose1");
                break;
            case SoundId.Blip:
                this.scene.sound.play(getRandomElement(["blip1"]));
                break;
        }
    }
}