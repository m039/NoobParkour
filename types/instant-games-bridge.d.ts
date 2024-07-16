declare var bridge: instantGamesBridge.InstantGamesBridgeInternal;

declare namespace instantGamesBridge  {
    interface Game {
        get visibilityState() : VISIBILITY_STATE;
        on(
            eventName:EVENT_NAME,
            callback: (state: VISIBILITY_STATE) => void
        ) : void;
    }

    interface Storage {
        get(key: string | Array<string>, options?: any) : Promise<any>;
        set(key: string | Array<string>, value: any, options?: any) : Promise<void>;
    }

    interface Advertisement  {
        showInterstitial(options?:any) : void;
        get isInterstitialReady() : boolean;
        showRewarded() : void;
        on(
            eventName:EVENT_NAME,
            callback: (state:INTERSTITIAL_STATE | VISIBILITY_STATE | REWARDED_STATE) => void
        ) : void;
    }
    
    interface Device {
        get type() : DEVICE_TYPE;
    }
    
    interface Platform {
        get language() : string;
        get sdk(): any;
        sendMessage(message: PLATFORM_MESSAGE) : void;
    }

    interface Player {
        get isAuthorizationSupported() : boolean;
        get isAuthorized() : boolean;
        authorize(options? : {[key:string | PLATFORM_ID] : {scopes: boolean}}) : Promise<void>;
    }

    interface Leaderboard {
        get isSetScoreSupported() : boolean;
        get isGetScoreSupported() : boolean;
        setScore(options : {[key:string | PLATFORM_ID] : {leaderboardName:string, score:number | string}}) : void;
        getScore(options : {[key:string | PLATFORM_ID] : {leaderboardName:string}}) : Promise<number>;
    }

    interface InstantGamesBridgeInternal {
        get platform() : Platform;
        get device() : Device;
        get storage() : Storage;
        get advertisement() : Advertisement;
        get leaderboard() : Leaderboard;
        get player() : Player;
        get game() : Game;
    }

    enum PLATFORM_ID {
        VK = 'vk',
        YANDEX = 'yandex',
        CRAZY_GAMES = 'crazy_games',
        ABSOLUTE_GAMES = 'absolute_games',
        GAME_DISTRIBUTION = 'game_distribution',
        MOCK = 'mock'
    }

    enum EVENT_NAME {
        INTERSTITIAL_STATE_CHANGED ='interstitial_state_changed',
        REWARDED_STATE_CHANGED = 'rewarded_state_changed',
        BANNER_STATE_CHANGED = 'banner_state_changed',
        VISIBILITY_STATE_CHANGED = 'visibility_state_changed'
    }

    enum INTERSTITIAL_STATE {
        LOADING = 'loading',
        OPENED = 'opened',
        CLOSED = 'closed',
        FAILED = 'failed'
    }

    enum REWARDED_STATE {
        LOADING = 'loading',
        OPENED = 'opened',
        CLOSED = 'closed',
        FAILED = 'failed',
        REWARDED = 'rewarded'
    }

    enum VISIBILITY_STATE {
        VISIBLE = 'visible',
        HIDDEN = 'hidden'
    }

    enum DEVICE_TYPE {
        DESKTOP = 'desktop',
        MOBILE = 'mobile',
        TABLET = 'tablet',
        TV = 'tv',
    }

    enum PLATFORM_MESSAGE  {
        GAME_READY = 'game_ready',
        IN_GAME_LOADING_STARTED = 'in_game_loading_started',
        IN_GAME_LOADING_STOPPED = 'in_game_loading_stopped',
        GAMEPLAY_STARTED = 'gameplay_started',
        GAMEPLAY_STOPPED = 'gameplay_stopped',
        PLAYER_GOT_ACHIEVEMENT = 'player_got_achievement',
    }
}