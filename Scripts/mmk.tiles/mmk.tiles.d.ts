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
    function eachFrame(onFrame: (dt: number) => void): void;
    function eachFrameWhile(onFrame: (dt: number) => boolean): void;
}
declare namespace mmk.tiles {
    /**
     * Represents a 2x3 matrix - except when it pretends to be 3x3 with an implicit identity column ;)
     *
     * | ax ay 0 |
     * | bx by 0 |
     * | ox oy 1 |
     */
    class Matrix2x3 {
        ax: number;
        ay: number;
        bx: number;
        by: number;
        ox: number;
        oy: number;
        constructor(ax: number, ay: number, bx: number, by: number, ox: number, oy: number);
        clone(): Matrix2x3;
        static identity: Matrix2x3;
        static translate(dx: number, dy: number): Matrix2x3;
        static rotate(radians: number): Matrix2x3;
        static scale(sx: number, sy?: number): Matrix2x3;
        translate(dx: number, dy: number): Matrix2x3;
        rotate(radians: number): Matrix2x3;
        scale(sx: number, sy?: number): Matrix2x3;
        determinant(): number;
        inverse(): Matrix2x3;
        static mul(...matricies: Matrix2x3[]): Matrix2x3;
        /** Transforms a point or vector by the full matrix */
        xformPoint(xy: XY): XY;
        /** Slices the last column / pretends we're multiplying by the 2x2 subset of the matrix.  Useful to avoid translating directional vectors, normals, etc. */
        xformNormal(xy: XY): XY;
        setContextTransform(context: CanvasRenderingContext2D): void;
    }
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
    function xy(x: number, y: number): XY;
    function size(w: number, h: number): Size;
    function rect(x: number, y: number, w: number, h: number): Rect;
    function roundRect(r: Rect): Rect;
    function fitSizeWithinRect(size: Size, bounds: Rect): Rect;
}
declare namespace mmk.tiles {
    interface SpriteRef {
        x: number;
        y: number;
        sprite: SpriteRenderer;
    }
    type RectTileMap_DenseCallback = (x: number, y: number) => SpriteRenderer[];
    type RectTileMap_SparseCallback = () => SpriteRef[];
    interface RectTileMapLayer {
        dense?: RectTileMap_DenseCallback;
        sparse?: RectTileMap_SparseCallback;
    }
    class RectTileMap {
        target: HTMLCanvasElement;
        private canvas;
        layers: RectTileMapLayer[];
        debugName: string;
        tileSize: Size;
        tileFocus: XY;
        tileAnchor: XY;
        viewportAnchor: XY;
        rotation: number;
        roundPixel: boolean;
        zoom: number;
        constructor(target: HTMLCanvasElement);
        render(): void;
        /** Returns tile XY relative to center ignoring anchoring - e.g. 0,0 is always the center Gof tile 0,0 */
        pixelToTileCenter(pixel: XY): XY;
        private actuallyRoundPixel;
        private ensureCanvasSizeTiles(canvas, w, h);
        private viewportAnchorPixel;
        private tileAnchorPixel;
        private tileEdgeToRender;
        private renderToTileCenter;
        private domToTileCenter;
        private domToRender;
    }
}
declare namespace mmk.tiles {
    interface SpriteRenderer {
        drawToContext(context: CanvasRenderingContext2D, cx: number, cy: number, cw: number, ch: number): void;
    }
    function createSpriteRendererImgPixels(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): SpriteRenderer;
}
