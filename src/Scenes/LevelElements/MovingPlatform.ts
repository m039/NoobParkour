import * as Phaser from 'phaser';
import TextureKeys from "src/Consts/TextureKeys";
import Player from 'src/Managers/Player';
import LevelElement from './LevelElement';

export default class MovingPlatform implements LevelElement {

    public platform : Phaser.GameObjects.Image;

    private moveSpeed : number;
    private moveDirection : number;
    private moveLength : number;
    private movePosition : Phaser.Math.Vector2;
    private movePositionPrevious : Phaser.Math.Vector2;
    
    private initDirection : Phaser.Math.Vector2;
    private initPosition : Phaser.Math.Vector2;
    private initLength : number;

    private resetValues: { direction:number, length:number };

    constructor(scene:Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        if (!tiledObject.polyline || tiledObject.polyline.length < 2) {
            throw new Error("The polyline is missing or invalid.");
        }

        let startPositionPercent = 0;
        this.moveSpeed = 50;
        this.moveDirection = 1;

        for (let property of tiledObject.properties) {
            if (property.name === "StartPosition") {
                startPositionPercent = Phaser.Math.Clamp(property.value, 0.0, 1.0);
            } else if (property.name === "Speed") {
                this.moveSpeed = property.value;
            } else if (property.name === "InverseStartDirection") {
                this.moveDirection = property.value == true? -1 : 1;
            }
        }

        const startPosition = tiledObject.polyline[0];
        const endPosition = tiledObject.polyline[1];

        startPosition.x += tiledObject.x;
        startPosition.y += tiledObject.y;

        endPosition.x += tiledObject.x;
        endPosition.y += tiledObject.y;

        this.initPosition = new Phaser.Math.Vector2(
            startPosition.x,
            startPosition.y
        );

        this.initDirection = new Phaser.Math.Vector2(
            endPosition.x - startPosition.x, 
            endPosition.y - startPosition.y
        );

        this.initLength = this.initDirection.length();

        this.initDirection.normalize();

        // Platform.

        this.movePosition = new Phaser.Math.Vector2();
        this.movePositionPrevious = new Phaser.Math.Vector2();
        this.moveLength = startPositionPercent * this.initLength;
        this.platform = scene.add.image(0, 0, TextureKeys.MovingPlatform);
        this.updatePlatformPosition();

        this.resetValues = {
            direction: this.moveDirection,
            length: this.moveLength
        };
    }

    public update(time:number, delta:number) : void {
        this.moveLength += 0.001 * delta * this.moveSpeed * this.moveDirection;
        if (this.moveLength < 0) {
            this.moveDirection = 1;
        } else if (this.moveLength > this.initLength) {
            this.moveDirection = -1;
        }
        this.updatePlatformPosition();
    }

    public reset() : void {
        this.moveDirection = this.resetValues.direction;
        this.moveLength = this.resetValues.length;
    }

    public adjustPlayerPosition(player: Player) {
        const platformBody = this.platform.body as Phaser.Physics.Arcade.Body;

        if (player.body.touching.down && platformBody.touching.up) {
            player.body.position.x += (this.movePosition.x - this.movePositionPrevious.x);
            player.body.position.y += (this.movePosition.y - this.movePositionPrevious.y);
        }
    }

    private updatePlatformPosition() : void {
        this.movePositionPrevious.copy(this.movePosition);

        let length = Phaser.Math.Easing.Cubic.InOut(this.moveLength / this.initLength) * this.initLength;

        this.movePosition.x = this.initDirection.x;
        this.movePosition.y = this.initDirection.y;
        this.movePosition.scale(length);
        this.movePosition.add(this.initPosition);

        this.platform.setPosition(this.movePosition.x, this.movePosition.y);
    }
}