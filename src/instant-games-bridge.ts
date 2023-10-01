export namespace InstantGamesBridge {
    export enum DEVICE_TYPE {
        DESKTOP = 'desktop',
        MOBILE = 'mobile',
        TABLET = 'tablet',
        TV = 'tv',
    }
}

declare interface Storage {
    get(key: string | Array<string>, options?: any) : Promise<any>
    set(key: string | Array<string>, value: any, options?: any) : Promise<void>
}

declare interface Device {
    get type() : InstantGamesBridge.DEVICE_TYPE
}

declare interface Platform {
    get language() : string;
}

declare class InstantGamesBridgeInternal {
    get platform() : Platform;
    get device() : Device;
    get storage() : Storage;
}

declare global {
    var bridge:InstantGamesBridgeInternal
}