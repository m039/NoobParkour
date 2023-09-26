export namespace InstantGamesBridge {
    export enum DEVICE_TYPE {
        DESKTOP = 'desktop',
        MOBILE = 'mobile',
        TABLET = 'tablet',
        TV = 'tv',
    }
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
}

declare global {
    var bridge:InstantGamesBridgeInternal
}