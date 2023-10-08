import * as Phaser from 'phaser';
import TextureKeys from "src/Consts/TextureKeys";
import LevelElement from './LevelElement';

export default class SawBlade implements LevelElement {

    public blades : Phaser.GameObjects.Image;

    private bladesPosition : Phaser.Math.Vector2;

    private bladesStartPosition : Phaser.Math.Vector2;

    private bladeMoveSpeed : number;

    private grooveDirection : Phaser.Math.Vector2;

    private grooveLength : number;

    private bladeMoveDirection : number;

    private bladeMoveLength : number;

    private resetValues : { direction:number, length:number };

    constructor(scene:Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        if (!tiledObject.polyline || tiledObject.polyline.length < 2) {
            throw new Error("The polyline is missing or invalid.");
        }

        let startPositionPercent = 0;
        this.bladeMoveSpeed = 50;
        this.bladeMoveDirection = 1;

        for (let property of tiledObject.properties) {
            if (property.name === "StartPosition") {
                startPositionPercent = Phaser.Math.Clamp(property.value, 0.0, 1.0);
            } else if (property.name === "Speed") {
                this.bladeMoveSpeed = property.value;
            } else if (property.name === "InverseStartDirection") {
                this.bladeMoveDirection = property.value == true? -1 : 1;
            }
        }

        const startPosition = tiledObject.polyline[0];
        const endPosition = tiledObject.polyline[1];

        startPosition.x += tiledObject.x;
        startPosition.y += tiledObject.y;

        endPosition.x += tiledObject.x;
        endPosition.y += tiledObject.y;

        this.bladesStartPosition = new Phaser.Math.Vector2(
            startPosition.x,
            startPosition.y
        );

        this.grooveDirection = new Phaser.Math.Vector2(
            endPosition.x - startPosition.x, 
            endPosition.y - startPosition.y
        );

        this.grooveLength = this.grooveDirection.length();

        this.grooveDirection.normalize();

        const angle = this.grooveDirection.angle();

        // Groove body.
        scene.add.image(
            (endPosition.x + startPosition.x) / 2,
            (endPosition.y + startPosition.y) / 2, 
            TextureKeys.SawGrooveBody
        )
        .setScale(this.grooveLength / 19.0, 1)
        .setAngle(angle * 180.0 / Math.PI);

        // Start groove head.
        scene.add.image(
                startPosition.x, 
                startPosition.y, 
                TextureKeys.SawGrooveHead
            )
            .setAngle(angle * 180.0 / Math.PI);

        // End groove head.
        scene.add.image(
                endPosition.x, 
                endPosition.y, 
                TextureKeys.SawGrooveHead
            )
            .setAngle(angle * 180.0 / Math.PI + 180.0);

        // Blades.
        this.bladesPosition = new Phaser.Math.Vector2();
        this.bladeMoveLength = startPositionPercent * this.grooveLength;
        this.blades = scene.add.image(0, 0, TextureKeys.SawBlades)
            .setOrigin(0.5, 0.5);
        this.updateBladesPosition();

        this.resetValues = {
            direction: this.bladeMoveDirection,
            length: this.bladeMoveLength
        };
    }

    public update(time:number, delta:number) : void {
        // Rotate.
        this.blades.rotation += Math.PI * 0.0015 * delta;

        // Move.
        this.bladeMoveLength += 0.001 * delta * this.bladeMoveSpeed * this.bladeMoveDirection;
        if (this.bladeMoveLength < 0) {
            this.bladeMoveDirection = 1;
        } else if (this.bladeMoveLength > this.grooveLength) {
            this.bladeMoveDirection = -1;
        }
        this.updateBladesPosition();
    }

    private updateBladesPosition() : void {
        this.bladesPosition.x = this.grooveDirection.x;
        this.bladesPosition.y = this.grooveDirection.y;
        this.bladesPosition.scale(this.bladeMoveLength);
        this.bladesPosition.add(this.bladesStartPosition);

        this.blades.setPosition(this.bladesPosition.x, this.bladesPosition.y);
    }

    public reset() : void {
        this.bladeMoveDirection = this.resetValues.direction;
        this.bladeMoveLength = this.resetValues.length;
    }
}
