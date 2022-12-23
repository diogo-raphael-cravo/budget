
export type ColorType = {
    r: number,
    g: number,
    b: number,
    a: number,
};

export function randomColor(): ColorType {
    return {
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        a: 0,
    };
}

export function colorToString(color: ColorType): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}
