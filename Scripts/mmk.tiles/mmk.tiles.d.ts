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
    function eachFrame(onFrame: () => void): void;
}
declare namespace mmk.tiles {
}
declare namespace mmk.tiles {
    type DenseMapCallback = (x: number, y: number) => SpriteRenderer[];
    interface DenseTileRendererConfig {
        debugName?: string;
        getTile: DenseMapCallback;
        tileSize: Size;
    }
    interface DenseTileRendererOrientation {
        target: HTMLCanvasElement;
        targetAnchor?: XY;
        spriteAnchor?: XY;
        focusTile?: XY;
        rotation?: number;
        roundPixel?: boolean;
        zoom?: number;
    }
    interface DenseTileRendererArgs extends DenseTileRendererOrientation {
    }
    class DenseTileRenderer {
        private config;
        private canvas;
        private ensureCanvasSizeTiles(canvas, w, h);
        constructor(config: DenseTileRendererConfig);
        render(args: DenseTileRendererArgs): void;
        pixelToTile(args: DenseTileRendererOrientation, pixel: XY): XY;
        private bakeOrientation(orient);
    }
    function createDenseMapLayerRenderer(config: DenseTileRendererConfig): DenseTileRenderer;
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
