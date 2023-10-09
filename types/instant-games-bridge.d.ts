declare var bridge: instantGamesBridge.InstantGamesBridgeInternal;

declare namespace instantGamesBridge  {
    interface Storage {
        get(key: string | Array<string>, options?: any) : Promise<any>
        set(key: string | Array<string>, value: any, options?: any) : Promise<void>
    }
    
    interface Device {
        get type() : DEVICE_TYPE
    }
    
    interface Platform {
        get language() : string;
    }

    interface InstantGamesBridgeInternal {
        get platform() : Platform;
        get device() : Device;
        get storage() : Storage;
    }

    enum DEVICE_TYPE {
        DESKTOP = 'desktop',
        MOBILE = 'mobile',
        TABLET = 'tablet',
        TV = 'tv',
    }
}