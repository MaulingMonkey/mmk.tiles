declare namespace mmk.tiles {
}
declare namespace mmk.tiles {
    function eachFrame(onFrame: () => void): void;
}
declare namespace mmk.tiles {
    interface XY {
        x: number;
        y: number;
    }
    interface Size {
        w: number;
        h: number;
    }
    interface Rect extends XY, Size {
    }
}
declare namespace mmk.tiles {
    interface SpriteRenderer {
        drawToContext(context: CanvasRenderingContext2D, cx: number, cy: number, cw: number, ch: number): void;
        drawToImageData(imageData: ImageData, cx: number, cy: number, cw: number, ch: number): void;
        drawToImageDataNoClip(imageData: ImageData, cx: number, cy: number, cw: number, ch: number): void;
    }
    function createSpriteRendererImgPixels(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): SpriteRenderer;
}
