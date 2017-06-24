declare namespace mmk.tiles {
}
declare namespace mmk.tiles {
    function autoResizeCanvas(canvas: string | HTMLCanvasElement, maxW?: number, maxH?: number): void;
}
declare namespace mmk.tiles {
    function benchmark(desc: string, time: number | (() => void)): void;
}
declare namespace mmk.tiles {
    type TilesetJson = {
        [id: string]: [number, number, number, number];
    };
    function createTileset(img: HTMLImageElement, json: TilesetJson): {
        [id: string]: SpriteRenderer;
    };
    function getTileset(imgUrl: string, jsonUrl?: string): {
        [id: string]: SpriteRenderer;
    };
}
declare namespace mmk.tiles {
    type DenseMapCallback = (x: number, y: number) => SpriteRenderer[];
    interface DenseTileRendererConfig {
        target: HTMLCanvasElement;
        getTile: DenseMapCallback;
    }
    class DenseTileRenderer {
        target: HTMLCanvasElement;
        getTile: DenseMapCallback;
        private canvas;
        debugName: string;
        tileSize: Size;
        tileFocus: XY;
        tileAnchor: XY;
        viewportAnchor: XY;
        rotation: number;
        roundPixel: boolean;
        zoom: number;
        private ensureCanvasSizeTiles(canvas, w, h);
        constructor(config: DenseTileRendererConfig);
        render(): void;
        pixelToTile(pixel: XY): XY;
        private bakeOrientation();
    }
    function createDenseMapLayerRenderer(config: DenseTileRendererConfig): DenseTileRenderer;
}
declare namespace mmk.tiles {
    function eachFrame(onFrame: () => void): void;
    function eachFrameWhile(onFrame: () => boolean): void;
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
    }
    function createSpriteRendererImgPixels(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): SpriteRenderer;
}
