import * as Phaser from 'phaser';
import LevelScene from '../LevelScene';
import TextureKeys from 'src/Consts/TextureKeys';
import Player from 'src/Managers/Player';
import SceneKeys from 'src/Consts/SceneKeys';
import AudioScene from '../AudioScene';
import { SoundId } from 'src/Managers/AudioManager';

const ArrowFlyDistance = 200;
const ArrowSpeed = 120;
const ArrowLaunchCooldown = 5000;
const ArrowActivationRadius = 400;
const ArrowFadeDuration = 400;
const ArrowSoundActivationRadius = 100;

export default class ArrowStatue {

    public arrow : Phaser.GameObjects.Image;

    private direction : number;
    private launchPosition : Phaser.Math.Vector2;    
    private cooldown : number;
    private dustEmmiter : Phaser.GameObjects.Particles.ParticleEmitter;
    private player : Player;
    private fadeTimer : number;

    constructor(
        levelScene:LevelScene, 
        x: number,
        y: number,
        faceLeft: boolean
    ) {
        this.player = levelScene.player;

        if (!faceLeft) {
            this.launchPosition = new Phaser.Math.Vector2(
                x + 16,
                y + 7
            );
            this.direction = 1;
        } else {
            this.launchPosition = new Phaser.Math.Vector2(
                x + 0,
                y + 7
            );
            this.direction = -1;
        }

        this.cooldown = 0;
        this.arrow = levelScene.add.image(
            this.launchPosition.x, 
            this.launchPosition.y,
            faceLeft? TextureKeys.ArrowLeft : TextureKeys.ArrowRight
        );

        this.dustEmmiter = levelScene.add.particles(0, 0, TextureKeys.Pixel, {
            lifespan: 600,
            speed: {min: 10, max: 20},
            scale: {start: 5, end: 0},
            rotate: {start: 0, end: 360},
            gravityX: this.direction == 1? 50:-50,
            emitting: false,
            tint: 0x9f935b
        });
        this.fadeTimer = -1;
    }

    public update(delta:number) {
        this.cooldown = Math.max(this.cooldown - delta, 0);

        if (Math.abs(this.arrow.x - this.launchPosition.x) > ArrowFlyDistance && 
            this.fadeTimer === -1) {
            this.fadeTimer = 0;
        }

        if (this.fadeTimer >= 0) {
            this.fadeTimer += delta;
            if (this.fadeTimer >= ArrowFadeDuration) {
                this.arrow.visible = false;
                const body = this.arrow.body as Phaser.Physics.Arcade.Body;
                body.enable = false;
                this.fadeTimer = -1;
            } else {
                this.arrow.alpha = 1 - this.fadeTimer / ArrowFadeDuration;
            }            
        }

        if (this.cooldown <= 0) {
            let between = Phaser.Math.Distance.Between(
                this.launchPosition.x, 
                this.launchPosition.y,
                this.player.container.x,
                this.player.container.y
            );

            if (between < ArrowActivationRadius) {
                if (between < ArrowSoundActivationRadius) {
                    const audioScene = this.arrow.scene.scene.get(SceneKeys.Audio) as AudioScene;
                    audioScene.audioManager.playSound(SoundId.ArrowShot);
                }
                
                this.arrow.active = true;
                this.arrow.x = this.launchPosition.x;
                this.arrow.visible = true;
                this.arrow.alpha = 1;

                const body = this.arrow.body as Phaser.Physics.Arcade.Body;
                body.setVelocityX(ArrowSpeed * this.direction);
                body.enable = true;

                this.dustEmmiter.emitParticleAt(this.launchPosition.x, this.launchPosition.y, 5);
            } else {
                const body = this.arrow.body as Phaser.Physics.Arcade.Body;
                body.enable = false;

                this.arrow.visible = false;
            }

            this.fadeTimer = -1;
            this.cooldown = ArrowLaunchCooldown;
        }
    }

    public arrowCollided() {
        this.dustEmmiter.emitParticleAt(this.arrow.x, this.arrow.y, 5);
        this.arrow.visible = false;

        const body = this.arrow.body as Phaser.Physics.Arcade.Body;
        body.enable = false;
    }
}