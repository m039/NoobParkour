import * as Phaser from 'phaser';
import { GameManager } from '../Scenes/BaseScene';
import { Prefs } from '../StaticManagers/PrefsStaticManager';
import SoundKeys from '../Consts/SoundKeys';

export enum SoundId {
    Jump,
    PickUpCoin,
    Loose,
    Blip,
    SandTile,
    LongJump,
    LongJumpTrampoline,
    ArrowShot,
    Swoosh,
    JumpLanding
}

export enum MusicId {
    Menu = SoundKeys.MenuMusic,
    Game1 = SoundKeys.Game1Music,
}

export default class AudioManager implements GameManager {
    private scene : Phaser.Scene;
    private music : Phaser.Sound.BaseSound;
    private arrowShotCooldown : number;
    private isAudioEnabled : boolean;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.arrowShotCooldown = 0;
        this.isAudioEnabled = true;
    }

    preload(): void {
    }

    create(): void {
        this.scene.sound.volume = 0.5;
    }

    update(time: number, delta: number): void {
        this.arrowShotCooldown = Math.max(this.arrowShotCooldown - delta, 0);
    }

    public disable() {
        if (this.music) {
            this.music.pause();
        }
        this.isAudioEnabled = false;
    }

    public enable() {
        if (this.music) {
            if (this.musicEnabled) {
                this.music.resume();
            }
        }
        this.isAudioEnabled = true;
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

        if (!this.musicEnabled || !this.isAudioEnabled) {
            this.music.pause();
        }
    }

    public playSound(soundId: SoundId) {
        if (!this.soundEnabled || !this.isAudioEnabled) {
            return;
        }

        switch (soundId) {
            case SoundId.Jump:
                this.scene.sound.play(SoundKeys.Jump2);
                break;
            case SoundId.PickUpCoin:
                this.scene.sound.play(SoundKeys.Coin1);
                break;
            case SoundId.Loose:
                this.scene.sound.play(SoundKeys.Loose1);
                break;
            case SoundId.Blip:
                this.scene.sound.play(SoundKeys.Blip1);
                break;
            case SoundId.SandTile:
                this.scene.sound.play(SoundKeys.SandTile);
                break;
            case SoundId.LongJump:
                this.scene.sound.play(SoundKeys.LongJump);
                break;
            case SoundId.LongJumpTrampoline:
                this.scene.sound.play(SoundKeys.LongJumpTrampoline);
                this.scene.sound.stopByKey(SoundKeys.JumpLanding);
                break;
            case SoundId.ArrowShot:
                if (this.arrowShotCooldown <= 0) {
                    this.scene.sound.play(SoundKeys.ArrowShot);
                    this.arrowShotCooldown = 50;
                }
                break;
            case SoundId.Swoosh:
                this.scene.sound.play(SoundKeys.Swoosh);
                break;
            case SoundId.JumpLanding:
                let isSoundPlaying = false;

                for (let sound of this.scene.sound.getAllPlaying()) {
                    if (sound.key === SoundKeys.LongJumpTrampoline || 
                        sound.key == SoundKeys.LongJump) {
                        isSoundPlaying = true;
                        break;
                    }
                }                

                if (!isSoundPlaying) {
                    this.scene.sound.play(SoundKeys.JumpLanding);
                }
                break;
        }
    }
}