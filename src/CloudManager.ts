import * as Phaser from 'phaser';
import { GameManager, IGameLevel } from './GameLevel';
import { getRandomElement } from './Utils';
import { GameLevelRestartEvent } from './Events';

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

    constructor(scene: Phaser.Scene, cloudConfig?: CloudManagerConfig) {
        this.scene = scene;
        this.cloudsData = [];

        if (cloudConfig) {
            this.CloudsCount = Math.max(cloudConfig.count ?? this.CloudsCount, 0);
            this.cloudBounds = cloudConfig.bounds;
            this.tilemap = cloudConfig.tilemap;
        }
    }

    preload(): void {
        const directory = "clouds_a";

        this.scene.load.image("cloud1", `assets/images/${directory}/Cloud1.png`);
        this.scene.load.image("cloud2", `assets/images/${directory}/Cloud2.png`);
        this.scene.load.image("cloud3", `assets/images/${directory}/Cloud3.png`);
    }

    create(): void {
        this.clouds = this.scene.add.group();
        this.direction = Math.random() < 0.5? -1 : 1;

        if (this.cloudBounds === undefined) {
            this.cloudBounds = this.getCloudBounds();
        }

        if (this.cloudBounds === undefined) {
            throw new Error("Can't find cloud bounds.");
        }

        this.createClouds();

        this.scene.events.on(GameLevelRestartEvent, () => this.createClouds());
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
        const key = getRandomElement(["cloud1", "cloud2", "cloud3"]);
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