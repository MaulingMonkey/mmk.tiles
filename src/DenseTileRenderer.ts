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
	//export type SparseSpriteRef = {x: number; y: number; sprites: SpriteRenderer[];};
	//export type SparseMapCallback = ()                     => SparseSpriteRef[];

	export interface DenseTileRendererConfig {
		getTile:       DenseMapCallback;
		tileSize:      Size; // e.g. 16x16
		//chunkSize?:    Size; // e.g. 8x8?
		// rounding config?
	}

	export interface DenseTileRendererOrientation {
		target:        HTMLCanvasElement;
		targetAnchor?: XY;     // 0..1
		spriteAnchor?: XY;     // 0..1
		focusTile?:    XY;
		rotation?:     number;  // in Radians
		roundPixel?:   boolean; // default: true
		zoom?:         number;  // default: 1
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

	export interface DenseTileRendererArgs extends DenseTileRendererOrientation {
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
	
	export class DenseTileRenderer {
		private config:             DenseTileRendererConfig;
		private canvas:             HTMLCanvasElement;
		private canvasNext:         HTMLCanvasElement;
		private canvasCurrentTiles: Rect;

		private ensureCanvasSizeTiles(canvas: HTMLCanvasElement, w: number, h: number): boolean { return ensureCanvasSizePixels(canvas, this.config.tileSize.w * w, this.config.tileSize.h * h); }

		constructor(config: DenseTileRendererConfig) {
			this.config             = config;
			this.canvas             = document.createElement("canvas");
			this.canvasNext         = document.createElement("canvas");
			this.canvasCurrentTiles = { x: 0, y: 0, w: 0, h: 0 };
		}

		render(args: DenseTileRendererArgs): void {
			const orient = this.bakeOrientation(args);
			const target = args.target;
			const tileW = this.config.tileSize.w;
			const tileH = this.config.tileSize.h;

			const tl = pixelToTile(orient, {x: 0,            y: 0            });
			const tr = pixelToTile(orient, {x: target.width, y: 0            });
			const br = pixelToTile(orient, {x: target.width, y: target.height});
			const bl = pixelToTile(orient, {x: 0           , y: target.height});

			const minTileX = Math.floor(Math.min(tl.x, tr.x, br.x, bl.x));
			const minTileY = Math.floor(Math.min(tl.y, tr.y, br.y, bl.y));
			const maxTileX = Math.ceil (Math.max(tl.x, tr.x, br.x, bl.x));
			const maxTileY = Math.ceil (Math.max(tl.y, tr.y, br.y, bl.y));
			const tilesWide = maxTileX - minTileX + 1;
			const tilesTall = maxTileY - minTileY + 1;

			// v1: Brute force
			{
				const getTile            = this.config.getTile;
				const canvas             = this.canvas;
				const canvasNext         = this.canvasNext;
				let   canvasCurrentTiles = this.canvasCurrentTiles;

				this.ensureCanvasSizeTiles(canvasNext, maxTileX-minTileX+1, maxTileY-minTileY+1);
				const context            = canvasNext.getContext("2d");
				context.clearRect(0, 0, canvasNext.width, canvasNext.height);

				for (let tileDy=0; tileDy<tilesTall; ++tileDy) for (let tileDx=0; tileDx<tilesWide; ++tileDx) {
					const tileX = tileDx + minTileX;
					const tileY = tileDy + minTileY;
					const tilePixelX = tileDx * tileW;
					const tilePixelY = tileDy * tileH;
					const sprites = getTile(tileX, tileY);
					for (let i=0; i<sprites.length; ++i) sprites[i].drawToContext(context, tilePixelX, tilePixelY, tileW, tileH);
				}

				// Swap buffers, write back
				this.canvas             = canvasNext;
				this.canvasNext         = canvas;
				this.canvasCurrentTiles = canvasCurrentTiles;
			}

			// Draw to 'real' target
			{
				const context = args.target.getContext("2d");
				context.setTransform(orient.cos, -orient.sin, orient.sin, orient.cos, orient.viewportAnchorX, orient.viewportAnchorY);
				context.drawImage(this.canvas, orient.tileAnchorX + (minTileX - orient.focusX) * tileW, orient.tileAnchorY + (minTileY - orient.focusY) * tileH, this.canvas.width, this.canvas.height);
			}
		}

		pixelToTile(args: DenseTileRendererOrientation, pixel: XY): XY {
			const baked = this.bakeOrientation(args);
			return pixelToTile(baked, pixel);
		}

		private bakeOrientation(orient: DenseTileRendererOrientation): DenseTileRendererBakedOrientation {
			const target             = orient.target;
			const rotation           = !orient.rotation ? 0 : orient.rotation;
			const roundPixel         = orient.roundPixel === undefined || !!orient.roundPixel; // consider ignoring if rotation isn't a multiple of pi/2 (90deg)
			let viewportAnchorX = target.width  * orient.targetAnchor.x;
			let viewportAnchorY = target.height * orient.targetAnchor.y;
			if (roundPixel) {
				viewportAnchorX = Math.round(viewportAnchorX);
				viewportAnchorY = Math.round(viewportAnchorY);
			}

			const tileW = this.config.tileSize.w;
			const tileH = this.config.tileSize.h;
			let tileAnchorX = tileW * orient.spriteAnchor.x;
			let tileAnchorY = tileH * orient.spriteAnchor.y;
			if (roundPixel) {
				tileAnchorX = Math.round(tileAnchorX);
				tileAnchorY = Math.round(tileAnchorY);
			}

			const cos = Math.cos(rotation);
			const sin = Math.sin(rotation);
			const originX = 0;
			const originY = 0;

			return { cos, sin, viewportAnchorX, viewportAnchorY, tileAnchorX, tileAnchorY, tileW, tileH, focusX: orient.focusTile.x, focusY: orient.focusTile.y };
		}
	}

	export function createDenseMapLayerRenderer(config: DenseTileRendererConfig): DenseTileRenderer {
		return new DenseTileRenderer(config);
	}
}
