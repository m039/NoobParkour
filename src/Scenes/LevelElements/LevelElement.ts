export default interface LevelElement {
    reset() : void;
    update(time:number, delta:number) : void;
};