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
	}

	export function createSpriteRendererImgPixels(img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number): SpriteRenderer {
		let renderer : SpriteRenderer = {
			drawToContext:         function(context,   cx, cy, cw, ch) {},
		};

		const onLoad = function(){
			const imgW = img.naturalWidth;
			const imgH = img.naturalHeight;
			console.assert(sx    <= imgW);
			console.assert(sx+sw <= imgW);
			console.assert(sy    <= imgH);
			console.assert(sy+sh <= imgH);

			renderer.drawToContext   = function(context, cx, cy, cw, ch) { context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch); };
		};
		img.addEventListener("load", onLoad);

		return renderer;
	}
}
