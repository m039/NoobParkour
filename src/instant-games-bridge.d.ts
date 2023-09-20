declare class Platform {
    get language() : string;
}

declare class InstantGamesBridge {
    get platform() : Platform;
}

declare var bridge : InstantGamesBridge;