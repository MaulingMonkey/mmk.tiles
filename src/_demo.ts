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
		let target = document.getElementById("mmk-tiles-demo") as HTMLCanvasElement;
		if (!target) return;
		console.assert(target.tagName === "CANVAS");
		let imgSrc = target.getAttribute("data-tile-map");
		const tileMap = getTileset(imgSrc);

		const worldW = 100;
		const worldH =  50;

		let mousePixel : XY = { x: 0, y: 0 };
		let curX = 3;
		let curY = 3;

		function getTile(x: number, y: number): SpriteRenderer[] {
			let tiles : SpriteRenderer[] = [];

			if ((0 <= x) && (x < worldW) && (0 <= y) && (y < worldH)) {
				let top   = y===0;
				let bot   = y===worldH-1;
				let left  = x===0;
				let right = x===worldW-1;

				let wall = bot || top || left || right;
				let bottomWall = wall && (bot || (top && !(left || right)));

				tiles.push(tileMap[bottomWall ? "wallBottom" : wall ? "wallTop" : "floorDot"]);
			}
			if (x === curX && y === curY) tiles.push(tileMap["selectTile"]);
			if (x === 5 && y === 5) tiles.push(tileMap["selectDot"]);

			return tiles;
		}

		let renderer = createDenseMapLayerRenderer({target, getTile});
		target.addEventListener("mousemove", function (ev) { mousePixel = { x: ev.offsetX, y: ev.offsetY }; });

		let imgData : ImageData;
		eachFrame(function(){
			let start = Date.now();
			let mouseTile = renderer.pixelToTileCenter(mousePixel);
			curX = Math.round(mouseTile.x);
			curY = Math.round(mouseTile.y);
			benchmark("clear demo", function()
			{
				const c = target.getContext("2d");
				c.setTransform(1,0,0,1,0,0);
				c.clearRect(0,0,target.width,target.height);
			});
			renderer.rotation = Math.cos(Date.now()/1000)/10;
			renderer.render();
			let end = Date.now();
			benchmark("---------------------------", 0);
			benchmark("Total"                      , end-start);
		});
	});
}
