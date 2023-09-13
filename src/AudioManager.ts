import * as Phaser from 'phaser';
import GameLevel, { GameManager } from './GameLevel';

export enum SoundId {
    Jump,
    PickUpCoin,
    Loose
}

export default class AudioManager implements GameManager {
    private gameLevel : GameLevel;

    constructor(gameLevel: GameLevel) {
        this.gameLevel = gameLevel;
    }

    preload(): void {
        this.gameLevel.load.audio("jump1", "assets/audio/jump1.wav");
        this.gameLevel.load.audio("jump2", "assets/audio/jump2.ogg");
        this.gameLevel.load.audio("coin1", "assets/audio/coin1.wav");
        this.gameLevel.load.audio("loose1", "assets/audio/loose1.wav");
    }

    create(): void {
        
    }

    update(time: number, delta: number): void {
        
    }

    public play(soundId: SoundId) {
        switch (soundId) {
            case SoundId.Jump:
                this.gameLevel.sound.play(this.getRandomElement(["jump1", "jump2"]));
                break;
            case SoundId.PickUpCoin:
                this.gameLevel.sound.play("coin1");
                break;
            case SoundId.Loose:
                this.gameLevel.sound.play("loose1");
                break;
        }
    }

    private getRandomElement(array: Array<string>) : string {
        return array[Math.floor(Math.random() * array.length)];
    }
}