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
	addEventListener("load", function(){
		let demo = document.getElementById("mmk-tiles-demo") as HTMLCanvasElement;
		if (!demo) return;
		console.assert(demo.tagName === "CANVAS");
		let imgSrc = demo.getAttribute("data-mmk-tilemap");
		let img = document.createElement("img");

		const tileMap : {[id: string]: SpriteRenderer} = {
			"wallTop":    createSpriteRendererImgPixels(img,  0,  0, 16, 16),
			"wallBottom": createSpriteRendererImgPixels(img,  0, 16, 16, 16),
			"floorDot":   createSpriteRendererImgPixels(img,  0, 32, 16, 16),
			"floorX":     createSpriteRendererImgPixels(img,  0, 48, 16, 16),
			"floorBlank": createSpriteRendererImgPixels(img, 16, 32, 16, 16),
			"selectTile": createSpriteRendererImgPixels(img, 16,  0, 16, 16),
			"selectDot":  createSpriteRendererImgPixels(img, 16, 16, 16, 16),
		};

		img.addEventListener("load", function(){
			let imgData : ImageData;
			eachFrame(function(){
				// Redraw the whole universe
				const w = demo.clientWidth  = demo.width;
				const h = demo.clientHeight = demo.height;
				const context = demo.getContext("2d");

				const tileW = 16;
				const tileH = 16;

				const worldH = h/16;
				const worldW = w/16;

				function eachTile(onTile: (tile: SpriteRenderer, offX: number, offY: number)=>void) {
					for (let y=0; y<worldH; ++y) for (let x=0; x<worldW; ++x) {
						let top   = y===0;
						let bot   = y===worldH-1;
						let left  = x===0;
						let right = x===worldW-1;

						let wall = bot || top || left || right;
						let bottomWall = wall && (bot || (top && !(left || right)));

						let tileIds = [];
						tileIds.push(bottomWall ? "wallBottom" : wall ? "wallTop" : "floorDot");
						if (x === 3 && y === 3) tileIds.push("selectTile");
						if (x === 5 && y === 5) tileIds.push("selectDot");

						for (let iTile=0; iTile<tileIds.length; ++iTile) { onTile(tileMap[tileIds[iTile]], x*tileW, y*tileH); }
					}
				}

				const blit = true;
				if (blit) {
					if (imgData === undefined || imgData.width !== w || imgData.height !== h) imgData = new ImageData(w, h);
					eachTile(function(sr,x,y) { sr.drawToImageData(imgData, x, y, tileW, tileH); });
					context.putImageData(imgData, 0, 0, 0, 0, w, h);
				} else {
					eachTile(function(sr,x,y) { sr.drawToContext(context, x, y, tileW, tileH); });
				}
			});
		});
		img.src = imgSrc;
	});
}
