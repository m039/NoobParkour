import * as Phaser from 'phaser';
import { getRandomElement } from '../Utils';
import { GameManager } from '../Scenes/BaseScene';
import EventKeys from '../Consts/EventKeys';
import TextureKeys from '../Consts/TextureKeys';

type CloudManagerConfig = {
    count? : number;
    bounds? : Phaser.Geom.Rectangle;
    tilemap? : () => Phaser.Tilemaps.Tilemap;
};

export default class CloudManager implements GameManager {
    private CloudsCount = 20;
    private CloudsMinSpeed = 5;
    private CloudsMaxSpeed = 15;

    private scene : Phaser.Scene;
    private tilemap? : () => Phaser.Tilemaps.Tilemap;
    private clouds : Phaser.GameObjects.Group;
    private cloudBounds : Phaser.Geom.Rectangle;
    private direction : number;
    private cloudsData : Array<{sprite : Phaser.GameObjects.Sprite, speed : number}>;
    private cloudConfig : CloudManagerConfig;

    constructor(scene: Phaser.Scene, cloudConfig?: CloudManagerConfig) {
        this.scene = scene;
        this.cloudsData = [];

        this.cloudConfig = cloudConfig;
    }

    preload(): void {
    }

    create(): void {
        this.clouds = this.scene.add.group();
        this.direction = Math.random() < 0.5? -1 : 1;

        if (this.cloudConfig) {
            this.CloudsCount = Math.max(this.cloudConfig.count ?? this.CloudsCount, 0);
            this.tilemap = this.cloudConfig.tilemap;

            if (this.cloudConfig.bounds) {
                this.cloudBounds = this.cloudConfig.bounds;
            } else {
                this.cloudBounds = this.getCloudBounds();
            }
        }

        if (this.cloudBounds === undefined) {
            throw new Error("Can't find cloud bounds.");
        }

        this.createClouds();

        this.scene.events.on(EventKeys.LevelRestart, () => this.createClouds());
    }

    update(time: number, delta: number): void {
        for (var children of this.cloudsData) {
            const cloud = children.sprite;
            const speed = children.speed;
            cloud.x += delta / 1000 * speed;

            if (this.direction < 0 && cloud.x < this.cloudBounds.left) {
                cloud.x = this.cloudBounds.right;
            } else if (this.direction > 0 && cloud.x > this.cloudBounds.right) {
                cloud.x = this.cloudBounds.left;
            }
        }
    }

    private createClouds() {
        this.clouds.clear(true, true);
        this.cloudsData.length = 0;

        for (var i = 0; i < this.CloudsCount; i++) {
            this.createCloud();
        }
    }

    private createCloud() {
        const key = getRandomElement([TextureKeys.Cloud1, TextureKeys.Cloud2, TextureKeys.Cloud3]);
        const yRatio = Math.random();
        const x = this.cloudBounds.left + this.cloudBounds.width * Math.random();
        const y = this.cloudBounds.top + this.cloudBounds.height * yRatio;

        const sprite = this.scene.add.sprite(x, y, key);
        sprite.depth = -1;
        this.clouds.add(sprite);

        this.cloudsData.push({
            sprite: sprite, 
            speed: this.direction * ((this.CloudsMaxSpeed - this.CloudsMinSpeed) * yRatio + this.CloudsMinSpeed)
        });
    }

    private getCloudBounds() : Phaser.Geom.Rectangle {
        if (this.tilemap === undefined) {
            return undefined;
        }

        const bounds = this.tilemap().findObject("Objects", (o) => o.name === "CloudBounds");
        if (bounds === undefined) {
            return undefined;
        }

        return new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
    }
}