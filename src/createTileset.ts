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
	export type TilesetJson = {[id: string]: [number, number, number, number]};

	function isLoaded(img: HTMLImageElement): boolean { return img.complete && img.naturalHeight !== 0; }

	export function createTileset(img: HTMLImageElement, json: TilesetJson): {[id: string]: SpriteRenderer} {
		let r : {[id: string]: SpriteRenderer} = {};
		Object.keys(json).forEach(key => {
			let [x,y,w,h] = json[key];
			r[key] = createSpriteRendererImgPixels(img,x,y,w,h);
		});
		return r;
	}

	export function getTileset(imgUrl: string, jsonUrl: string = undefined): {[id: string]: SpriteRenderer} {
		console.assert(!!imgUrl, "createTileset: imgUrl required");
		if (jsonUrl === undefined) jsonUrl = imgUrl.substr(0, imgUrl.lastIndexOf('.')) + ".json";

		let tileset : {[id: string]: SpriteRenderer} = {};
		let img = document.createElement("img");
		let xhrJson = new XMLHttpRequest();

		let imgReady = false;
		let jsonReady = false;
		let tryUpdate = function() {
			if (!imgReady || !jsonReady) return;
			let response = xhrJson.response;
			if (!(response instanceof Object)) response = JSON.parse(response);
			let r = createTileset(img, response as TilesetJson);
			Object.keys(r).forEach(key => tileset[key] = r[key]);
			tryUpdate = function() {}; // done
		}

		img.addEventListener("load", function(){ imgReady = true; tryUpdate(); });
		img.src = imgUrl;
		imgReady = isLoaded(img);

		xhrJson.open("GET", jsonUrl, true);
		xhrJson.responseType = "json";
		xhrJson.addEventListener("load", function(){ jsonReady = true; tryUpdate(); });
		xhrJson.send();

		return tileset;
	}
}
