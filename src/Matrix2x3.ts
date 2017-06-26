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
	/**
	 * Represents a 2x3 matrix - except when it pretends to be 3x3 with an implicit identity column ;)
	 *
	 * | ax ay 0 |
	 * | bx by 0 |
	 * | ox oy 1 |
	 */
	export class Matrix2x3 {
		ax: number;
		ay: number;
		bx: number;
		by: number;
		ox: number;
		oy: number;

		constructor(ax: number, ay: number, bx: number, by: number, ox: number, oy: number) {
			this.ax = ax;
			this.ay = ay;
			this.bx = bx;
			this.by = by;
			this.ox = ox;
			this.oy = oy;
		}

		clone() { return new Matrix2x3(this.ax, this.ay, this.bx, this.by, this.ox, this.oy); }

		static get identity()                     { return new Matrix2x3(1, 0, 0, 1, 0, 0); }
		static translate(dx: number, dy: number)  { return new Matrix2x3(1, 0, 0, 1, dx, dy); }
		static rotate(radians: number)            { const cos = Math.cos(radians); const sin = Math.sin(radians); return new Matrix2x3(cos, sin, -sin, cos, 0, 0); }
		static scale(sx: number, sy: number = sx) { return new Matrix2x3(sx, 0, 0, sy, 0, 0); }

		translate(dx: number, dy: number)      { return Matrix2x3.mul(this, Matrix2x3.translate(dx,dy)  ); }
		rotate   (radians: number)             { return Matrix2x3.mul(this, Matrix2x3.rotate   (radians)); }
		scale    (sx: number, sy: number = sx) { return Matrix2x3.mul(this, Matrix2x3.scale    (sx,sy)  ); }

		static mul(...matricies: Matrix2x3[]): Matrix2x3 {
			if (matricies.length === 0) return Matrix2x3.identity;
			if (matricies.length === 1) return matricies[0].clone();

			let {ax,ay,bx,by,ox,oy} = matricies[0];

			for (let i=1; i<matricies.length; ++i) {
				const r = matricies[i];
				// "every row" dot "every column"

				const row0 = [ax, ay, 0];
				const row1 = [bx, by, 0];
				const row2 = [ox, oy, 1];

				const col0 = [r.ax, r.bx, r.ox];
				const col1 = [r.ay, r.by, r.oy];
				const col2 = [0, 0, 1];

				ax = dot(row0, col0);
				bx = dot(row1, col0);
				ox = dot(row2, col0);

				ay = dot(row0, col1);
				by = dot(row1, col1);
				oy = dot(row2, col1);

				// Sanity check "rowN" dot "col2"
				console.assert(dot(row0, [0,0,1]) === 0);
				console.assert(dot(row1, [0,0,1]) === 0);
				console.assert(dot(row2, [0,0,1]) === 1);
			}

			return new Matrix2x3(ax, ay, bx, by, ox, oy);
		}

		/** Transforms a point or vector by the full matrix */
		xformPoint(xy: XY): XY {
			const a = xy.x;
			const b = xy.y;
			const x = a*this.ax + b*this.bx + 1*this.ox;
			const y = a*this.ay + b*this.by + 1*this.oy;
			return {x,y};
		}

		/** Slices the last column / pretends we're multiplying by the 2x2 subset of the matrix.  Useful to avoid translating directional vectors, normals, etc. */
		xformNormal(xy: XY): XY {
			const a = xy.x;
			const b = xy.y;
			const x = a*this.ax + b*this.bx; // + 0*this.ox;
			const y = a*this.ay + b*this.by; // + 0*this.oy;
			return {x,y};
		}

		setContextTransform(context: CanvasRenderingContext2D) {
			context.setTransform(this.ax, this.ay, this.bx, this.by, this.ox, this.oy); // ?
		}
	}

	function dot(l: number[], r: number[]): number {
		console.assert(l.length === r.length);
		let s = 0;
		for (let i=0, n=l.length; i<n; ++i) s += l[i] * r[i];
		return s;
	}

	function unitTests() {
		const approxLimit = 0.001;
		function approxEqualXY(a: XY, b: XY): boolean { return Math.abs(a.x-b.x)<approxLimit && Math.abs(a.y-b.y)<approxLimit; }
		function assertApproxEqualXY(a: XY, b: XY) { console.assert(approxEqualXY(a,b), "should be equal:\n\tA =",a,"\n\tB =",b); }

		const rot90 = Matrix2x3.rotate(Math.PI/2);
		assertApproxEqualXY( Matrix2x3.identity                                                                   .xformPoint (xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.identity                                                                   .xformNormal(xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.rotate(Math.PI)                                                            .xformPoint (xy(2,3)), xy(-2,-3) );
		assertApproxEqualXY( Matrix2x3.rotate(Math.PI)                                                            .xformNormal(xy(2,3)), xy(-2,-3) );
		assertApproxEqualXY( Matrix2x3.rotate(2*Math.PI)                                                          .xformPoint (xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.rotate(2*Math.PI)                                                          .xformNormal(xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.rotate( Math.PI/2).rotate( Math.PI/2).rotate( Math.PI/2).rotate( Math.PI/2).xformPoint (xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.rotate(-Math.PI/2).rotate(-Math.PI/2).rotate(-Math.PI/2).rotate(-Math.PI/2).xformPoint (xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.mul(rot90, rot90, rot90, rot90)                                            .xformPoint (xy(2,3)), xy(2,3)   );
		assertApproxEqualXY( Matrix2x3.scale(3)                                                                   .xformPoint (xy(2,3)), xy(6,9)   );
		assertApproxEqualXY( Matrix2x3.scale(-1)                                                                  .xformPoint (xy(2,3)), xy(-2,-3) );
		assertApproxEqualXY( Matrix2x3.scale(-1,-1)                                                               .xformPoint (xy(2,3)), xy(-2,-3) );
		assertApproxEqualXY( Matrix2x3.scale(-1,-1)                                                               .xformNormal(xy(2,3)), xy(-2,-3) );
		assertApproxEqualXY( Matrix2x3.translate(1,5)                                                             .xformPoint (xy(2,3)), xy(3,8)   );
		assertApproxEqualXY( Matrix2x3.translate(1,5)                                                             .xformNormal(xy(2,3)), xy(2,3)   );
	}
	addEventListener("load", unitTests);
}
