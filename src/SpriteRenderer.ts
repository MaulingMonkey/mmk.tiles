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
	export interface SpriteRenderer {
		drawToContext        (context:   CanvasRenderingContext2D, cx: number, cy: number, cw: number, ch: number): void;
		drawToImageData      (imageData: ImageData,                cx: number, cy: number, cw: number, ch: number): void;
		drawToImageDataNoClip(imageData: ImageData,                cx: number, cy: number, cw: number, ch: number): void;
	}

	function isCompletelyOpaque(imgData: ImageData): boolean {
		const d = imgData.data;
		const n = 4 * imgData.width * imgData.height;
		console.assert(n <= imgData.data.length);
		// Bytewise component order: [R, G, B, A, ...]
		const pixelOffsetA = 3;
		const pixelStride  = 4;
		for (let o=pixelOffsetA; o<n; o += pixelStride) if (d[o] !== 0xFF) return false;
		return true;
	}

	function isCompletelyOpaqueWithin(imgData: ImageData, sx: number, sy: number, sw: number, sh: number): boolean {
		// TODO: Clip

		const d  = imgData.data;
		const dW = imgData.width;

		for (let dy=0; dy<sh; ++dy) {
			let iAlpha = 3 + 4 * (sx + dW * (sy+dy));
			for (let dx=0; dx<sw; ++dx) {
				if (d[iAlpha] !== 0xFF) return false;
				iAlpha += 4;
			}
		}
		return true;
	}

	function fillClip(dst: ImageData, color: number): void {
		const dst0 = new Uint32Array(dst.data.buffer);
		const dstW = dst.width;
		const dstH = dst.height;
		const dstN = dstW * dstH;

		for (let i=0; i<dstN; ++i) dst0[i] = color;
	}

	function opaqueBlitNoClip(dst: ImageData, src: ImageData, dstX: number, dstY: number, srcX: number, srcY: number, w: number, h: number): void {
		const dst0 = new Uint32Array(dst.data.buffer);
		const src0 = new Uint32Array(src.data.buffer);
		const dstW = dst.width;
		const srcW = src.width;

		for (let y=0; y<h; ++y) {
			let dstI = (dstX + dstW * (dstY + y));
			let srcI = (srcX + srcW * (srcY + y));
			for (let x=0; x<w; ++x) dst0[dstI++] = src0[srcI++]; // RGBA
		}
	}

	function opaqueBlit(dst: ImageData, src: ImageData, dstX: number, dstY: number, srcX: number, srcY: number, w: number, h: number): void {
		const dstW = dst.width;
		const dstH = dst.height;
		const srcW = src.width;
		const srcH = src.height;

		// Clip
		if (dstX < 0) { w += dstX; srcX -= dstX; dstX = 0; }
		if (dstY < 0) { h += dstY; srcY -= dstY; dstY = 0; }
		if (srcX < 0) { w += srcX; dstX -= srcX; srcX = 0; }
		if (srcY < 0) { h += srcY; dstY -= srcY; srcY = 0; }
		if (dstX+w > dstW) w = dstX-dstW;
		if (dstY+h > dstH) h = dstY-dstH;
		if (srcX+w > srcW) w = srcX-srcW;
		if (srcY+h > srcH) h = srcY-srcH;
		if (w<0 || h<0) return;

		opaqueBlitNoClip(dst, src, dstX, dstY, srcX, srcY, w, h);
	}

	function transparentBlitNoClip(dst: ImageData, src: ImageData, dstX: number, dstY: number, srcX: number, srcY: number, w: number, h: number): void {
		const dst0 = dst.data;
		const src0 = src.data;
		const dstW = dst.width;
		const srcW = src.width;

		for (let y=0; y<h; ++y) {
			let dstI = 4 * (dstX + dstW * (dstY + y));
			let srcI = 4 * (srcX + srcW * (srcY + y));
			for (let x=0; x<w; ++x) {
				let srcR = src0[srcI++];
				let srcG = src0[srcI++];
				let srcB = src0[srcI++];
				let srcA = src0[srcI++];

				let dstR = dst0[dstI+0];
				let dstG = dst0[dstI+1];
				let dstB = dst0[dstI+2];
				let dstA = dst0[dstI+3];

				// Fustratingly, ImageData uses *non*-premultiplied alpha.
				const dstA_invSrcA_01 = dstA*(255-srcA)/255;
				const srcA_01 = srcA/255;
				dst0[dstI++] = ((dstR*dstA_invSrcA_01/255)|0) + ((srcR * srcA_01)|0); // R
				dst0[dstI++] = ((dstG*dstA_invSrcA_01/255)|0) + ((srcG * srcA_01)|0); // G
				dst0[dstI++] = ((dstB*dstA_invSrcA_01/255)|0) + ((srcB * srcA_01)|0); // B
				dst0[dstI++] = ((     dstA_invSrcA_01    )|0) + ((srcA          )|0); // A
			}
		}
	}

	function transparentBlit(dst: ImageData, src: ImageData, dstX: number, dstY: number, srcX: number, srcY: number, w: number, h: number): void {
		const dstW = dst.width;
		const dstH = dst.height;
		const srcW = src.width;
		const srcH = src.height;

		// Clip
		if (dstX < 0) { w += dstX; srcX -= dstX; dstX = 0; }
		if (dstY < 0) { h += dstY; srcY -= dstY; dstY = 0; }
		if (srcX < 0) { w += srcX; dstX -= srcX; srcX = 0; }
		if (srcY < 0) { h += srcY; dstY -= srcY; srcY = 0; }
		if (dstX+w > dstW) w = dstX-dstW;
		if (dstY+h > dstH) h = dstY-dstH;
		if (srcX+w > srcW) w = srcX-srcW;
		if (srcY+h > srcH) h = srcY-srcH;
		if (w<0 || h<0) return;

		transparentBlitNoClip(dst, src, dstX, dstY, srcX, srcY, w, h);
	}

	export function createSpriteRendererImgPixels(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): SpriteRenderer {
		let renderer : SpriteRenderer = {
			drawToContext:         function(context,   cx, cy, cw, ch) {},
			drawToImageData:       function(imageData, cx, cy, cw, ch) {},
			drawToImageDataNoClip: function(imageData, cx, cy, cw, ch) {},
		};

		const onLoad = function(){
			const imgW = img.naturalWidth;
			const imgH = img.naturalHeight;
			console.assert(sx    <= imgW);
			console.assert(sx+sw <= imgW);
			console.assert(sy    <= imgH);
			console.assert(sy+sh <= imgH);

			const canvas = document.createElement("canvas");
			canvas.width = canvas.clientWidth = imgW;
			canvas.height = canvas.clientHeight = imgH;
			const imgDataContext = canvas.getContext("2d");
			imgDataContext.drawImage(img, 0, 0, imgW, imgH, 0, 0, imgW, imgH);
			// TODO: "Try" in case of CORS, older browser, etc.?
			const imgData = imgDataContext.getImageData(0, 0, imgW, imgH);
			const isOpaque = !!imgData && isCompletelyOpaqueWithin(imgData, sx, sy, sw, sh);

			renderer.drawToContext   = function(context, cx, cy, cw, ch) { context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch); };

			if      (!imgData) renderer.drawToImageData = undefined;
			else if (isOpaque) renderer.drawToImageData = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); opaqueBlit     (dst, imgData, cx, cy, sx, sy, sw, sh); };
			else               renderer.drawToImageData = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); transparentBlit(dst, imgData, cx, cy, sx, sy, sw, sh); };

			if      (!imgData) renderer.drawToImageDataNoClip = undefined;
			else if (isOpaque) renderer.drawToImageDataNoClip = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); opaqueBlitNoClip     (dst, imgData, cx, cy, sx, sy, sw, sh); };
			else               renderer.drawToImageDataNoClip = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); transparentBlitNoClip(dst, imgData, cx, cy, sx, sy, sw, sh); };
		};
		img.addEventListener("load", onLoad);

		return renderer;
	}
}
