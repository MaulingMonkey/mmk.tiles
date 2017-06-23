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
	interface BenchmarkEntry {
		desc: string;
		time: number;
	}

	let times : BenchmarkEntry[];

	export function benchmark(desc: string, time: number | (()=>void)) {
		if (times === undefined) {
			if (time instanceof Function) (time as ()=>void)();
			return;
		}
		if (time instanceof Function) {
			let tStart = Date.now();
			(time as ()=>void)();
			let tEnd = Date.now();
			time = tEnd-tStart;
		}
		times.push({desc, time: time as number});
	}

	addEventListener("load", function(){
		let div = document.getElementById("mmk-tiles-debug-profiling");
		if (!div) return;

		times = [];

		let table = document.createElement("table");

		let thead = document.createElement("thead");
		let thRow  = document.createElement("tr");
		let thDesc = document.createElement("th");
		let thTime = document.createElement("th");
		thDesc.textContent = "Description";
		thDesc.style.minWidth = "20em";
		thTime.textContent = "ms";
		thTime.style.minWidth = "5em";
		thRow.appendChild(thDesc);
		thRow.appendChild(thTime);
		thead.appendChild(thRow);
		table.appendChild(thead);

		let tbody = document.createElement("tbody");
		table.appendChild(tbody);
		div.appendChild(table);

		let callback = function() {
			requestAnimationFrame(callback);
			while (!!tbody.lastChild) tbody.removeChild(tbody.lastChild); // clear
			times.forEach(function (e){
				let tdDesc = document.createElement("td");
				tdDesc.textContent = e.desc;
				let tdTime = document.createElement("td");
				tdTime.textContent = e.time.toFixed(0);
				let tr = document.createElement("tr");
				tr.appendChild(tdDesc);
				tr.appendChild(tdTime);
				tbody.appendChild(tr);
			});
			times = [];
		};
		requestAnimationFrame(callback);
	});
}
