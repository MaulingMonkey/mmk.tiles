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
			// Redraw the whole universe
			const w = demo.clientWidth  = demo.width;
			const h = demo.clientHeight = demo.height;

			const tileW = 16;
			const tileH = 16;

			const worldH = h/16;
			const worldW = w/16;

			let mousePixel : XY = { x: 0, y: 0 };
			let curX = 3;
			let curY = 3;

			function getTile(x: number, y: number): SpriteRenderer[] {
				if (x<0 || y<0 || x>=worldW || y>=worldH) return [];

				let top   = y===0;
				let bot   = y===worldH-1;
				let left  = x===0;
				let right = x===worldW-1;

				let wall = bot || top || left || right;
				let bottomWall = wall && (bot || (top && !(left || right)));

				let tiles : SpriteRenderer[] = [];
				tiles.push(tileMap[bottomWall ? "wallBottom" : wall ? "wallTop" : "floorDot"]);
				if (x === curX && y === curY) tiles.push(tileMap["selectTile"]);
				if (x === 5 && y === 5) tiles.push(tileMap["selectDot"]);

				return tiles;
			}

			function eachTile(onTile: (tile: SpriteRenderer, offX: number, offY: number)=>void) {
				for (let y=0; y<worldH; ++y) for (let x=0; x<worldW; ++x) {
					let tiles = getTile(x,y);
					for (let iTile=0; iTile<tiles.length; ++iTile) { onTile(tiles[iTile], x*tileW, y*tileH); }
				}
			}


			let renderer = createDenseMapLayerRenderer({
				tileSize: { w: 16, h: 16 },
				getTile,
			});
			let orientation : DenseTileRendererOrientation = {
				target: demo,

				// Top Left
				//targetAnchor: { x: 0, y: 0 }, // Top left of viewport
				//spriteAnchor: { x: 0, y: 0 }, // Top left of sprite
				//focusTile:    { x: 0, y: 0 }, // 0,0 is top left sprite

				// Center
				targetAnchor: { x: 0.5, y: 0.5 },
				spriteAnchor: { x: 0.5, y: 0.5 },
				focusTile:    { x: worldW/2, y: worldH/2 },

				rotation:     Math.cos(Date.now()/1000)/10,
				roundPixel:   false,
			};
			demo.addEventListener("mousemove", function (ev) {
				mousePixel = { x: ev.offsetX, y: ev.offsetY };
			});

			let imgData : ImageData;
			eachFrame(function(){
				let start = Date.now();
				const cached = true;
				const blit = true;
				if (cached) {
					let mouseTile = renderer.pixelToTile(orientation, mousePixel);
					curX = Math.round(mouseTile.x);
					curY = Math.round(mouseTile.y);
					{
						const c = demo.getContext("2d");
						c.setTransform(1,0,0,1,0,0);
						c.clearRect(0,0,demo.width,demo.height);
					}
					orientation.rotation = Math.cos(Date.now()/1000)/10;
					renderer.render(orientation);
				} else if (blit) {
					const context = demo.getContext("2d");
					if (imgData === undefined || imgData.width !== w || imgData.height !== h) imgData = new ImageData(w, h);
					eachTile(function(sr,x,y) { sr.drawToImageData(imgData, x, y, tileW, tileH); });
					context.putImageData(imgData, 0, 0, 0, 0, w, h);
				} else {
					const context = demo.getContext("2d");
					eachTile(function(sr,x,y) { sr.drawToContext(context, x, y, tileW, tileH); });
				}
				let end = Date.now();
				{
					const c = demo.getContext("2d");
					c.setTransform(1,0,0,1,0,0);
					c.fillStyle = "#000";
					c.fillRect(19, 19, 32, 14);
					c.fillStyle = "#FFF";
					c.fillRect(20, 20, 30, 12);
					c.fillStyle = "#000";
					c.fillText(Math.round(end-start)+"ms", 20, 30);
				}
			});
		});
		img.src = imgSrc;
	});
}
