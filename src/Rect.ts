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
	export interface XY   { x: number; y: number; }
	export interface Size { w: number; h: number; }
	export interface Rect extends XY, Size {}

	export function xy(x: number, y: number): XY { return {x,y}; }
	export function size(w: number, h: number): Size { return {w,h}; }
	export function rect(x: number, y: number, w: number, h: number): Rect { return {x,y,w,h}; }

	export function roundRect(r: Rect): Rect {
		return rect(Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h));
	}

	export function fitSizeWithinRect(size: Size, bounds: Rect): Rect {
		const scaleW = bounds.w / size.w;
		const scaleH = bounds.h / size.h;
		const scale = Math.min(scaleW,scaleH);

		const w = size.w * scale;
		const h = size.h * scale;
		const x = bounds.x + (bounds.w - w)/2;
		const y = bounds.y + (bounds.h - h)/2;

		return {x,y,w,h};
	}
}
