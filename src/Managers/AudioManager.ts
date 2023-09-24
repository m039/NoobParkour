import * as Phaser from 'phaser';
import { GameManager } from '../Scenes/BaseScene';
import { Prefs } from '../StaticManagers/PrefsStaticManager';

export enum SoundId {
    Jump,
    PickUpCoin,
    Loose,
    Blip
}

export enum MusicId {
    Menu = "menu-music",
    Game1 = "game-1-music",
    Game2 = "game-2-music"
}

export default class AudioManager implements GameManager {
    private scene : Phaser.Scene;
    private music : Phaser.Sound.BaseSound;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    preload(): void {
        this.scene.load.audio("jump1", "assets/audio/sounds/jump1.wav");
        this.scene.load.audio("jump2", "assets/audio/sounds/jump2.ogg");
        this.scene.load.audio("coin1", "assets/audio/sounds/coin1.wav");
        this.scene.load.audio("loose1", "assets/audio/sounds/loose1.wav");
        this.scene.load.audio("blip1", "assets/audio/sounds/blipSelect1.wav");
        this.scene.load.audio("blip2", "assets/audio/sounds/blipSelect2.wav");
        this.scene.load.audio(MusicId.Menu, "assets/audio/music/Retro Beat.ogg");
        this.scene.load.audio(MusicId.Game1, "assets/audio/music/Stage 1.mp3");
        this.scene.load.audio(MusicId.Game2, "assets/audio/music/Stage 2.mp3");
    }

    create(): void {
        this.scene.sound.volume = 0.5;
    }

    update(time: number, delta: number): void {
        
    }

    public get soundEnabled() : boolean {
        return Prefs.getSoundEnabled();
    }

    public set soundEnabled(enabled:boolean) {
        Prefs.setSoundEnabled(enabled);
    }

    public get musicEnabled() : boolean {
        return Prefs.getMusicEnabled();
    }

    public set musicEnabled(enabled: boolean) {
        Prefs.setMusicEnabled(enabled);
        if (this.music) {
            if (enabled) {
                this.music.resume();
            } else {
                this.music.pause();
            }
        }
    }

    public playMusic(musicId: MusicId) {
        if (this.music) {
            if (this.music.key === musicId) {
                return;
            }

            this.music.stop();
            this.music.destroy();
        }

        this.music = this.scene.sound.add(musicId);
        this.music.play({loop: true});

        if (!this.musicEnabled) {
            this.music.pause();
        }
    }

    public playSound(soundId: SoundId) {
        if (!this.soundEnabled) {
            return;
        }

        switch (soundId) {
            case SoundId.Jump:
                this.scene.sound.play("jump2");
                break;
            case SoundId.PickUpCoin:
                this.scene.sound.play("coin1");
                break;
            case SoundId.Loose:
                this.scene.sound.play("loose1");
                break;
            case SoundId.Blip:
                this.scene.sound.play("blip1");
                break;
        }
    }
}