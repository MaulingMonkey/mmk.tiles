﻿// Copyright 2017 MaulingMonkey
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
	export function eachFrame(onFrame: ()=>void) {
		let callback : ()=>void;
		callback = function(){
			requestAnimationFrame(callback);
			onFrame();
		};
		callback();
	}

	export function eachFrameWhile(onFrame: ()=>boolean) {
		let callback : ()=>void;
		let t : number;
		callback = function(){
			t = requestAnimationFrame(callback);
			if (!onFrame()) cancelAnimationFrame(t);
		};
		callback();
	}
}
