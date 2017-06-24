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
	var warned = false;
	export function autoResizeCanvas(canvas: string|HTMLCanvasElement, maxW: number = 4096, maxH: number = maxW) {
		const e = ((<any>canvas).__proto__ === (<any>"").__proto__ ? document.getElementById(<any>canvas) : <any>canvas) as HTMLCanvasElement;
		eachFrameWhile(function(){
			// Things start getting really hairy above ~110MB used in my experience (e.g. mass zoom out)
			let scale = Math.min(1, maxW/e.clientWidth, maxH/e.clientHeight);
			e.width  = Math.round(scale * e.clientWidth);
			e.height = Math.round(scale * e.clientHeight);
			if (scale<1 && !warned) {
				console.warn("canvas size clamed to a max of",maxW,"x",maxH,"(client size is",e.clientWidth,"x",e.clientHeight,", further clamping will not be warned about.)");
				warned = true;
			}
			// Current default limit of 4k x 4k is ~67MB.  2k x 2k would allow for 4+ layers without problems - possibly worth...
			return e.parentElement !== undefined;
		});
	}
}
