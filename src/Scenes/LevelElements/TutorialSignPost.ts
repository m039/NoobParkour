import * as Phaser from 'phaser';

import TextureKeys from "src/Consts/TextureKeys";
import LevelScene from "../LevelScene";
import Player from "src/Managers/Player";
import EventKeys from "src/Consts/EventKeys";
import LevelElement from './LevelElement';

export default class TutorialSignPost extends Phaser.GameObjects.Image implements LevelElement {
    arcadeBody : Phaser.Physics.Arcade.Body;
    overlap : boolean;
    wasOverlap : boolean;
    textKey : string;
    player : Player;
    bounds : Phaser.Geom.Rectangle;

    constructor(levelScene: LevelScene, x:number, y:number, textKey:string) {
        super(levelScene, Math.round(x), Math.round(y), TextureKeys.SignPostDefault);

        this.setOrigin(0.5, 1);
        this.textKey = textKey;

        this.player = levelScene.player;
        this.bounds = new Phaser.Geom.Rectangle(x - 25, y - 25, 50, 50);

        this.on("overlapstart", () => {
            this.setTexture(TextureKeys.SignPostHovered);
            levelScene.events.emit(EventKeys.ShowHelpBox, this.textKey);
        });
        this.on("overlapend", () => {
            this.setTexture(TextureKeys.SignPostDefault);
            levelScene.events.emit(EventKeys.HideHelpBox);
        });
    }

    public reset(): void {
    }

    public update(time:number, delta:number) : void {
        if (this.overlap && !this.wasOverlap) {
            this.emit("overlapstart");
        }

        if (!this.overlap && this.wasOverlap) {
            this.emit("overlapend");
        }

        this.wasOverlap = this.overlap;
        this.overlap = Phaser.Geom.Intersects.RectangleToRectangle(this.bounds, this.player.container.getBounds());
    }
}