export function getRandomElement(array: Array<string>) : string {
    return array[Math.floor(Math.random() * array.length)];
}