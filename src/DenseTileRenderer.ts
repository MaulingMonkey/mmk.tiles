// Copyright 2017 MaulingMonkey
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

namespace mmk.tiles {
	export type DenseMapCallback  = (x: number, y: number) => SpriteRenderer[];

	export interface DenseTileRendererConfig {
		target:        HTMLCanvasElement;
		getTile:       DenseMapCallback;
	}

	interface DenseTileRendererBakedOrientation {
		sin:             number;
		cos:             number;
		viewportAnchorX: number;
		viewportAnchorY: number;
		tileAnchorX:     number;
		tileAnchorY:     number;
		tileW:           number;
		tileH:           number;
		focusX:          number;
		focusY:          number;
	}

	function ensureCanvasSizePixels(canvas: HTMLCanvasElement, w: number, h: number): boolean {
		let dirty = false;
		if (canvas.width  < w) { canvas.width  = w; dirty = true; }
		if (canvas.height < h) { canvas.height = h; dirty = true; }
		return dirty;
	}

	function pixelToTile(o: DenseTileRendererBakedOrientation, pixel: XY): XY {
		const { cos, sin } = o;

		// relative to the unrotated frame centered on the viewport anchor
		const VAdx = pixel.x - o.viewportAnchorX;
		const VAdy = pixel.y - o.viewportAnchorY;

		// relative to the rotated frame centered on the viewport anchor
		const RVAdx = VAdx * cos - VAdy * sin;
		const RVAdy = VAdx * sin + VAdy * cos;

		// TODO: Hoist -0.5s to focusX/Y?
		const x = (RVAdx - o.tileAnchorX) / o.tileW - 0.5 + o.focusX;
		const y = (RVAdy - o.tileAnchorY) / o.tileH - 0.5 + o.focusY;

		return { x, y };
	}

	function parseBool(s: string): boolean {
		if (s === undefined || s == null) return <any>s;
		if (s.toLowerCase() === "true" ) return true;
		if (s.toLowerCase() === "false") return false;
		return undefined;
	}

	function parseXY(s: string): XY {
		if (s === undefined || s == null) return <any>s;
		const [x,y] = s.split(',').map(parseFloat);
		return {x,y};
	}

	function parseSize(s: string): Size {
		const xy = parseXY(s);
		if (!xy) return <Size><any>xy; // null, undefined
		return {w:xy.x, h:xy.y};
	}
	
	export class DenseTileRenderer {
		target:         HTMLCanvasElement; // The final target to render to
		getTile:        DenseMapCallback;  // Callback to fetch the tile(s) to render at any given integer (x,y) coordinate.
		private canvas: HTMLCanvasElement; // Internal buffer for seamless pixel-aligned composition before e.g. subpixel translation, rotation, etc.

		debugName:      string;            // For benchmarking display only
		tileSize:       Size;              // The baseline tile/grid size in "pixels".  Individual tile images might be larger if they overflow their tile, although DenseTileRenderer isn't coded to support this yet.
		tileFocus:      XY;                // Which logical tile coordinate is underneath the origin of the target.
		tileAnchor:     XY;                // Where the origin of sprites are, as a [0..1] "percentage" of the tile/sprite's width/height.  [0,0] for top/left, [0.5,0.5] for center of the tile/sprite.
		viewportAnchor: XY;                // Where the origin of the target is as a [0..1] "percentage" of target's width/height.     [0,0] for top/left, [0.5,0.5] for center of the canvas.
		rotation:       number;            // Radians to rotate the viewport right/clockwise around the origin of the viewport.
		roundPixel:     boolean;           // Should rendering snap to the nearest full pixel.  Pixel perfect rendering vs non-smooth scrolling.
		zoom:           number;            // Unused/unimplemented - should be used to scale the size of visible tiles. 1 = default zoom, 2 = double size, 0.5 = half size, etc.

		private ensureCanvasSizeTiles(canvas: HTMLCanvasElement, w: number, h: number): boolean { return ensureCanvasSizePixels(canvas, this.tileSize.w * w, this.tileSize.h * h); }

		constructor(config: DenseTileRendererConfig) {
			console.assert(!!config.target,  "config.target required");
			console.assert(!!config.getTile, "config.getTile required"); // FIXME: Allow DOM specified callback?

			function initFromAttr<T>(attribute: string, attributeParser: (attr: string)=>T, fallback: T): T {
				let a = config.target.getAttribute(attribute);
				if (a === undefined || a === null) return fallback;
				let r : T;
				try { r = attributeParser(a); } catch (e) { console.error(config.target,"bad",attribute,"value:",e); return fallback; }
				if (r === undefined || r === null) { console.error(config.target,"bad",attribute,"value"); return fallback; }
				return r;
			}

			this.target         = config.target;
			this.getTile        = config.getTile;
			this.canvas         = document.createElement("canvas");

			this.debugName      = initFromAttr("data-debug-name",      s=>s,       undefined        );
			this.tileSize       = initFromAttr("data-tile-size",       parseSize,  {w: 16,  h: 16 } );
			this.tileFocus      = initFromAttr("data-tile-focus",      parseXY,    {x: 0,   y: 0}   );
			this.tileAnchor     = initFromAttr("data-tile-anchor",     parseXY,    {x: 0.5, y: 0.5} );
			this.viewportAnchor = initFromAttr("data-viewport-anchor", parseXY,    {x: 0.5, y: 0.5} );
			this.rotation       = initFromAttr("data-rotation",        parseFloat, 0                );
			this.roundPixel     = initFromAttr("data-round-to-pixel",  parseBool,  false            );
			this.zoom           = initFromAttr("data-zoom",            parseFloat, 1                );
		}

		render(): void {
			let tStart = Date.now();

			const orient = this.bakeOrientation();
			const target = this.target;
			const tileW = this.tileSize.w;
			const tileH = this.tileSize.h;

			const tl = pixelToTile(orient, {x: 0,            y: 0            });
			const tr = pixelToTile(orient, {x: target.width, y: 0            });
			const br = pixelToTile(orient, {x: target.width, y: target.height});
			const bl = pixelToTile(orient, {x: 0           , y: target.height});

			const minTileX = Math.round(Math.min(tl.x, tr.x, br.x, bl.x));
			const minTileY = Math.round(Math.min(tl.y, tr.y, br.y, bl.y));
			const maxTileX = Math.round(Math.max(tl.x, tr.x, br.x, bl.x));
			const maxTileY = Math.round(Math.max(tl.y, tr.y, br.y, bl.y));
			const tilesWide = maxTileX - minTileX + 1;
			const tilesTall = maxTileY - minTileY + 1;

			const getTile            = this.getTile;

			let tStartRenderToCanvas = Date.now();

			// v1: Brute force
			{
				const canvas             = this.canvas;

				this.ensureCanvasSizeTiles(canvas, maxTileX-minTileX+1, maxTileY-minTileY+1);
				const context            = canvas.getContext("2d");
				context.clearRect(0, 0, canvas.width, canvas.height);

				for (let tileDy=0; tileDy<tilesTall; ++tileDy) for (let tileDx=0; tileDx<tilesWide; ++tileDx) {
					const tileX = tileDx + minTileX;
					const tileY = tileDy + minTileY;
					const tilePixelX = tileDx * tileW;
					const tilePixelY = tileDy * tileH;
					const sprites = getTile(tileX, tileY);
					for (let i=0; i<sprites.length; ++i) {
						let sprite = sprites[i];
						if (sprite !== undefined) sprite.drawToContext(context, tilePixelX, tilePixelY, tileW, tileH);
					}
				}
			}

			let tStartRenderToTarget = Date.now();

			// Draw to 'real' target
			{
				const context = this.target.getContext("2d");
				context.setTransform(orient.cos, -orient.sin, orient.sin, orient.cos, orient.viewportAnchorX, orient.viewportAnchorY);
				context.drawImage(this.canvas, orient.tileAnchorX + (minTileX - orient.focusX) * tileW, orient.tileAnchorY + (minTileY - orient.focusY) * tileH, this.canvas.width, this.canvas.height);
			}

			let tEnd = Date.now();

			const prefix = this.debugName === undefined ? "" : this.debugName + " ";
			benchmark(prefix+"precalc",          tStartRenderToCanvas - tStart);
			benchmark(prefix+"render to canvas", tStartRenderToTarget - tStartRenderToCanvas);
			benchmark(prefix+"render to target", tEnd                 - tStartRenderToTarget);
			benchmark(prefix+"update benchmarks", Date.now()          - tEnd);
		}

		pixelToTile(pixel: XY): XY {
			const baked = this.bakeOrientation();
			return pixelToTile(baked, pixel);
		}

		private bakeOrientation(): DenseTileRendererBakedOrientation {
			const target             = this.target;
			const rotation           = this.rotation;
			const roundPixel         = this.roundPixel; // consider ignoring if rotation isn't a multiple of pi/2 (90deg)
			let viewportAnchorX = target.width  * this.viewportAnchor.x;
			let viewportAnchorY = target.height * this.viewportAnchor.y;
			if (roundPixel) {
				viewportAnchorX = Math.round(viewportAnchorX);
				viewportAnchorY = Math.round(viewportAnchorY);
			}

			const tileW = this.tileSize.w;
			const tileH = this.tileSize.h;
			let tileAnchorX = tileW * this.tileAnchor.x;
			let tileAnchorY = tileH * this.tileAnchor.y;
			if (roundPixel) {
				tileAnchorX = Math.round(tileAnchorX);
				tileAnchorY = Math.round(tileAnchorY);
			}

			const cos = Math.cos(rotation);
			const sin = Math.sin(rotation);
			const originX = 0;
			const originY = 0;

			return { cos, sin, viewportAnchorX, viewportAnchorY, tileAnchorX, tileAnchorY, tileW, tileH, focusX: this.tileFocus.x, focusY: this.tileFocus.y };
		}
	}

	export function createDenseMapLayerRenderer(config: DenseTileRendererConfig): DenseTileRenderer {
		return new DenseTileRenderer(config);
	}
}
