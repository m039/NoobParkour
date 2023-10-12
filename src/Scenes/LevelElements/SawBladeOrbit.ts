import * as Phaser from 'phaser';
import TextureKeys from "src/Consts/TextureKeys";
import LevelElement from './LevelElement';

export default class SawBladeOrbit implements LevelElement {
    public blades : Phaser.GameObjects.Image;

    private chains : Array<Phaser.GameObjects.Image>;
    private line : Phaser.Geom.Line;
    private radius : number;
    private angle : number;
    private rotationSpeed : number;
    private resetValues : { angle:number };

    constructor(scene:Phaser.Scene, tiledObject:Phaser.Types.Tilemaps.TiledObject) {
        if (!tiledObject.ellipse) {
            throw new Error("Only ellipse is supported for SawOrbit.");
        }

        this.rotationSpeed = 1;
        this.angle = 0;

        if (tiledObject.properties) {
            for (let property of tiledObject.properties) {
                if (property.name === "StartAngle") {
                    this.angle = Phaser.Math.DegToRad(property.value);
                } else if (property.name === "RotationSpeed") {
                    this.rotationSpeed = property.value;
                }
            }
        }

        this.resetValues = { angle:this.angle };

        this.line = new Phaser.Geom.Line(
            tiledObject.x + tiledObject.width / 2,
            tiledObject.y + tiledObject.height / 2, 
            tiledObject.x + tiledObject.width, 
            tiledObject.y + tiledObject.height / 2
        );
        this.radius = Math.min(tiledObject.width, tiledObject.height);
        const length = Phaser.Geom.Line.Length(this.line);

        const count = Math.floor(length / 5);
        this.chains = [];
        for (let i = 0; i < count; i++) {
            this.chains.push(scene.add.image(0, 0, TextureKeys.SawChain));
        }

        this.blades = scene.add.image(0, 0, TextureKeys.SawBlades);

        this.rotate(0);
    }

    reset(): void {
        this.angle = this.resetValues.angle;
    }

    update(time: number, delta: number): void {
        this.rotate(delta);
    }

    private rotate(delta:number) {
        // Rotate chains.
        this.angle += delta * 0.001 * Math.PI * this.rotationSpeed;

        this.line.x2 = this.line.x1 + Math.cos(this.angle) * this.radius;
        this.line.y2 = this.line.y1 + Math.sin(this.angle) * this.radius;

        Phaser.Actions.PlaceOnLine(this.chains, this.line);

        // Rotate blades.
        this.blades.x = this.line.x2;
        this.blades.y = this.line.y2;
        this.blades.rotation += delta * 0.003 * Math.PI;
    }
}