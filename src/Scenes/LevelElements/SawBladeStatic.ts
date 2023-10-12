import * as Phaser from 'phaser';
import TextureKeys from "src/Consts/TextureKeys";
import LevelElement from './LevelElement';

export default class SawBladeStatic implements LevelElement {
    public blades : Phaser.GameObjects.Sprite;

    constructor(scene:Phaser.Scene, tiledObject:Phaser.Types.Tilemaps.TiledObject) {
        this.blades = scene.add.sprite(tiledObject.x, tiledObject.y, TextureKeys.SawBladesStatic);
    }

    reset(): void {
        
    }

    update(time: number, delta: number): void {
        const RotationSpeed = 0.002 * delta * Math.PI * 2;

        this.blades.rotation += RotationSpeed;
    }
}