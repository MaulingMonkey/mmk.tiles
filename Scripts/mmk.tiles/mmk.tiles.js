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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles_1) {
        addEventListener("load", function () {
            var target = document.getElementById("mmk-tiles-demo");
            if (!target)
                return;
            console.assert(target.tagName === "CANVAS");
            var imgSrc = target.getAttribute("data-tile-map");
            var tileMap = tiles_1.getTileset(imgSrc);
            var worldW = 100;
            var worldH = 50;
            var mousePixel = { x: 0, y: 0 };
            var curX = 3;
            var curY = 3;
            function getTile(x, y) {
                var tiles = [];
                if ((0 <= x) && (x < worldW) && (0 <= y) && (y < worldH)) {
                    var top_1 = y === 0;
                    var bot = y === worldH - 1;
                    var left = x === 0;
                    var right = x === worldW - 1;
                    var wall = bot || top_1 || left || right;
                    var bottomWall = wall && (bot || (top_1 && !(left || right)));
                    tiles.push(tileMap[bottomWall ? "wallBottom" : wall ? "wallTop" : "floorDot"]);
                }
                if (x === curX && y === curY)
                    tiles.push(tileMap["selectTile"]);
                if (x === 5 && y === 5)
                    tiles.push(tileMap["selectDot"]);
                return tiles;
            }
            var renderer = tiles_1.createDenseMapLayerRenderer({ target: target, getTile: getTile });
            target.addEventListener("mousemove", function (ev) { mousePixel = { x: ev.offsetX, y: ev.offsetY }; });
            var imgData;
            tiles_1.eachFrame(function () {
                var start = Date.now();
                var mouseTile = renderer.pixelToTile(mousePixel);
                curX = Math.round(mouseTile.x);
                curY = Math.round(mouseTile.y);
                tiles_1.benchmark("clear demo", function () {
                    var c = target.getContext("2d");
                    c.setTransform(1, 0, 0, 1, 0, 0);
                    c.clearRect(0, 0, target.width, target.height);
                });
                renderer.rotation = Math.cos(Date.now() / 1000) / 10;
                renderer.render();
                var end = Date.now();
                tiles_1.benchmark("---------------------------", 0);
                tiles_1.benchmark("Total", end - start);
            });
        });
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        var warned = false;
        function autoResizeCanvas(canvas, maxW, maxH) {
            if (maxW === void 0) { maxW = 4096; }
            if (maxH === void 0) { maxH = maxW; }
            var e = (canvas.__proto__ === "".__proto__ ? document.getElementById(canvas) : canvas);
            tiles.eachFrameWhile(function () {
                // Things start getting really hairy above ~110MB used in my experience (e.g. mass zoom out)
                var scale = Math.min(1, maxW / e.clientWidth, maxH / e.clientHeight);
                e.width = Math.round(scale * e.clientWidth);
                e.height = Math.round(scale * e.clientHeight);
                if (scale < 1 && !warned) {
                    console.warn("canvas size clamed to a max of", maxW, "x", maxH, "(client size is", e.clientWidth, "x", e.clientHeight, ", further clamping will not be warned about.)");
                    warned = true;
                }
                // Current default limit of 4k x 4k is ~67MB.  2k x 2k would allow for 4+ layers without problems - possibly worth...
                return e.parentElement !== undefined;
            });
        }
        tiles.autoResizeCanvas = autoResizeCanvas;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        var times;
        function benchmark(desc, time) {
            if (times === undefined) {
                if (time instanceof Function)
                    time();
                return;
            }
            if (time instanceof Function) {
                var tStart = Date.now();
                time();
                var tEnd = Date.now();
                time = tEnd - tStart;
            }
            times.push({ desc: desc, time: time });
        }
        tiles.benchmark = benchmark;
        addEventListener("load", function () {
            var div = document.getElementById("mmk-tiles-debug-profiling");
            if (!div)
                return;
            times = [];
            var table = document.createElement("table");
            var thead = document.createElement("thead");
            var thRow = document.createElement("tr");
            var thDesc = document.createElement("th");
            var thTime = document.createElement("th");
            thDesc.textContent = "Description";
            thDesc.style.minWidth = "20em";
            thTime.textContent = "ms";
            thTime.style.minWidth = "5em";
            thRow.appendChild(thDesc);
            thRow.appendChild(thTime);
            thead.appendChild(thRow);
            table.appendChild(thead);
            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
            div.appendChild(table);
            var callback = function () {
                requestAnimationFrame(callback);
                while (!!tbody.lastChild)
                    tbody.removeChild(tbody.lastChild); // clear
                times.forEach(function (e) {
                    var tdDesc = document.createElement("td");
                    tdDesc.textContent = e.desc;
                    var tdTime = document.createElement("td");
                    tdTime.textContent = e.time.toFixed(0);
                    var tr = document.createElement("tr");
                    tr.appendChild(tdDesc);
                    tr.appendChild(tdTime);
                    tbody.appendChild(tr);
                });
                times = [];
            };
            requestAnimationFrame(callback);
        });
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        function isLoaded(img) { return img.complete && img.naturalHeight !== 0; }
        function createTileset(img, json) {
            var r = {};
            Object.keys(json).forEach(function (key) {
                var _a = json[key], x = _a[0], y = _a[1], w = _a[2], h = _a[3];
                r[key] = tiles.createSpriteRendererImgPixels(img, x, y, w, h);
            });
            return r;
        }
        tiles.createTileset = createTileset;
        function getTileset(imgUrl, jsonUrl) {
            if (jsonUrl === void 0) { jsonUrl = undefined; }
            console.assert(!!imgUrl, "createTileset: imgUrl required");
            if (jsonUrl === undefined)
                jsonUrl = imgUrl.substr(0, imgUrl.lastIndexOf('.')) + ".json";
            var tileset = {};
            var img = document.createElement("img");
            var xhrJson = new XMLHttpRequest();
            var imgReady = false;
            var jsonReady = false;
            var tryUpdate = function () {
                if (!imgReady || !jsonReady)
                    return;
                var response = xhrJson.response;
                if (!(response instanceof Object))
                    response = JSON.parse(response);
                var r = createTileset(img, response);
                Object.keys(r).forEach(function (key) { return tileset[key] = r[key]; });
                tryUpdate = function () { }; // done
            };
            img.addEventListener("load", function () { imgReady = true; tryUpdate(); });
            img.src = imgUrl;
            imgReady = isLoaded(img);
            xhrJson.open("GET", jsonUrl, true);
            xhrJson.responseType = "json";
            xhrJson.addEventListener("load", function () { jsonReady = true; tryUpdate(); });
            xhrJson.send();
            return tileset;
        }
        tiles.getTileset = getTileset;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        function ensureCanvasSizePixels(canvas, w, h) {
            var dirty = false;
            if (canvas.width < w) {
                canvas.width = w;
                dirty = true;
            }
            if (canvas.height < h) {
                canvas.height = h;
                dirty = true;
            }
            return dirty;
        }
        function pixelToTile(o, pixel) {
            var cos = o.cos, sin = o.sin;
            // relative to the unrotated frame centered on the viewport anchor
            var VAdx = pixel.x - o.viewportAnchorX;
            var VAdy = pixel.y - o.viewportAnchorY;
            // relative to the rotated frame centered on the viewport anchor
            var RVAdx = VAdx * cos - VAdy * sin;
            var RVAdy = VAdx * sin + VAdy * cos;
            // TODO: Hoist -0.5s to focusX/Y?
            var x = (RVAdx - o.tileAnchorX) / o.tileW - 0.5 + o.focusX;
            var y = (RVAdy - o.tileAnchorY) / o.tileH - 0.5 + o.focusY;
            return { x: x, y: y };
        }
        function parseBool(s) {
            if (s === undefined || s == null)
                return s;
            if (s.toLowerCase() === "true")
                return true;
            if (s.toLowerCase() === "false")
                return false;
            return undefined;
        }
        function parseXY(s) {
            if (s === undefined || s == null)
                return s;
            var _a = s.split(',').map(parseFloat), x = _a[0], y = _a[1];
            return { x: x, y: y };
        }
        function parseSize(s) {
            var xy = parseXY(s);
            if (!xy)
                return xy; // null, undefined
            return tiles.size(xy.x, xy.y);
        }
        var DenseTileRenderer = (function () {
            function DenseTileRenderer(config) {
                console.assert(!!config.target, "config.target required");
                console.assert(!!config.getTile, "config.getTile required"); // FIXME: Allow DOM specified callback?
                function initFromAttr(attribute, attributeParser, fallback) {
                    var a = config.target.getAttribute(attribute);
                    if (a === undefined || a === null)
                        return fallback;
                    var r;
                    try {
                        r = attributeParser(a);
                    }
                    catch (e) {
                        console.error(config.target, "bad", attribute, "value:", e);
                        return fallback;
                    }
                    if (r === undefined || r === null) {
                        console.error(config.target, "bad", attribute, "value");
                        return fallback;
                    }
                    return r;
                }
                this.target = config.target;
                this.getTile = config.getTile;
                this.canvas = document.createElement("canvas");
                this.debugName = initFromAttr("data-debug-name", function (s) { return s; }, undefined);
                this.tileSize = initFromAttr("data-tile-size", parseSize, tiles.size(16, 16));
                this.tileFocus = initFromAttr("data-tile-focus", parseXY, tiles.xy(0, 0));
                this.tileAnchor = initFromAttr("data-tile-anchor", parseXY, tiles.xy(0.5, 0.5));
                this.viewportAnchor = initFromAttr("data-viewport-anchor", parseXY, tiles.xy(0.5, 0.5));
                this.rotation = initFromAttr("data-rotation", parseFloat, 0);
                this.roundPixel = initFromAttr("data-round-to-pixel", parseBool, false);
                this.zoom = initFromAttr("data-zoom", parseFloat, 1);
            }
            DenseTileRenderer.prototype.ensureCanvasSizeTiles = function (canvas, w, h) { return ensureCanvasSizePixels(canvas, this.tileSize.w * w, this.tileSize.h * h); };
            DenseTileRenderer.prototype.render = function () {
                var tStart = Date.now();
                var orient = this.bakeOrientation();
                var target = this.target;
                var tileW = this.tileSize.w;
                var tileH = this.tileSize.h;
                var tl = pixelToTile(orient, tiles.xy(0, 0));
                var tr = pixelToTile(orient, tiles.xy(target.width, 0));
                var br = pixelToTile(orient, tiles.xy(target.width, target.height));
                var bl = pixelToTile(orient, tiles.xy(0, target.height));
                var minTileX = Math.round(Math.min(tl.x, tr.x, br.x, bl.x));
                var minTileY = Math.round(Math.min(tl.y, tr.y, br.y, bl.y));
                var maxTileX = Math.round(Math.max(tl.x, tr.x, br.x, bl.x));
                var maxTileY = Math.round(Math.max(tl.y, tr.y, br.y, bl.y));
                var tilesWide = maxTileX - minTileX + 1;
                var tilesTall = maxTileY - minTileY + 1;
                var getTile = this.getTile;
                var tStartRenderToCanvas = Date.now();
                // v1: Brute force
                {
                    var canvas = this.canvas;
                    this.ensureCanvasSizeTiles(canvas, maxTileX - minTileX + 1, maxTileY - minTileY + 1);
                    var context = canvas.getContext("2d");
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    for (var tileDy = 0; tileDy < tilesTall; ++tileDy)
                        for (var tileDx = 0; tileDx < tilesWide; ++tileDx) {
                            var tileX = tileDx + minTileX;
                            var tileY = tileDy + minTileY;
                            var tilePixelX = tileDx * tileW;
                            var tilePixelY = tileDy * tileH;
                            var sprites = getTile(tileX, tileY);
                            for (var i = 0; i < sprites.length; ++i) {
                                var sprite = sprites[i];
                                if (sprite !== undefined)
                                    sprite.drawToContext(context, tilePixelX, tilePixelY, tileW, tileH);
                            }
                        }
                }
                var tStartRenderToTarget = Date.now();
                // Draw to 'real' target
                {
                    var context = this.target.getContext("2d");
                    context.setTransform(orient.cos, -orient.sin, orient.sin, orient.cos, orient.viewportAnchorX, orient.viewportAnchorY);
                    context.drawImage(this.canvas, orient.tileAnchorX + (minTileX - orient.focusX) * tileW, orient.tileAnchorY + (minTileY - orient.focusY) * tileH, this.canvas.width, this.canvas.height);
                }
                var tEnd = Date.now();
                var prefix = this.debugName === undefined ? "" : this.debugName + " ";
                tiles.benchmark(prefix + "precalc", tStartRenderToCanvas - tStart);
                tiles.benchmark(prefix + "render to canvas", tStartRenderToTarget - tStartRenderToCanvas);
                tiles.benchmark(prefix + "render to target", tEnd - tStartRenderToTarget);
                tiles.benchmark(prefix + "update benchmarks", Date.now() - tEnd);
            };
            DenseTileRenderer.prototype.pixelToTile = function (pixel) {
                var baked = this.bakeOrientation();
                return pixelToTile(baked, pixel);
            };
            DenseTileRenderer.prototype.bakeOrientation = function () {
                var target = this.target;
                var rotation = this.rotation;
                var roundPixel = this.roundPixel; // consider ignoring if rotation isn't a multiple of pi/2 (90deg)
                var viewportAnchorX = target.width * this.viewportAnchor.x;
                var viewportAnchorY = target.height * this.viewportAnchor.y;
                if (roundPixel) {
                    viewportAnchorX = Math.round(viewportAnchorX);
                    viewportAnchorY = Math.round(viewportAnchorY);
                }
                var tileW = this.tileSize.w;
                var tileH = this.tileSize.h;
                var tileAnchorX = tileW * this.tileAnchor.x;
                var tileAnchorY = tileH * this.tileAnchor.y;
                if (roundPixel) {
                    tileAnchorX = Math.round(tileAnchorX);
                    tileAnchorY = Math.round(tileAnchorY);
                }
                var cos = Math.cos(rotation);
                var sin = Math.sin(rotation);
                var originX = 0;
                var originY = 0;
                return { cos: cos, sin: sin, viewportAnchorX: viewportAnchorX, viewportAnchorY: viewportAnchorY, tileAnchorX: tileAnchorX, tileAnchorY: tileAnchorY, tileW: tileW, tileH: tileH, focusX: this.tileFocus.x, focusY: this.tileFocus.y };
            };
            return DenseTileRenderer;
        }());
        tiles.DenseTileRenderer = DenseTileRenderer;
        function createDenseMapLayerRenderer(config) {
            return new DenseTileRenderer(config);
        }
        tiles.createDenseMapLayerRenderer = createDenseMapLayerRenderer;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        function eachFrame(onFrame) {
            var callback;
            callback = function () {
                requestAnimationFrame(callback);
                onFrame();
            };
            callback();
        }
        tiles.eachFrame = eachFrame;
        function eachFrameWhile(onFrame) {
            var callback;
            var t;
            callback = function () {
                t = requestAnimationFrame(callback);
                if (!onFrame())
                    cancelAnimationFrame(t);
            };
            callback();
        }
        tiles.eachFrameWhile = eachFrameWhile;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        /**
         * Represents a 3x2 matrix - except when it pretends to be 3x3 with an implicit identity row ;)
         *
         * | ax bx ox |
         * | ay by oy |
         * | 0  0  1  |
         */
        var Matrix3x2 = (function () {
            function Matrix3x2(ax, ay, bx, by, ox, oy) {
                this.ax = ax;
                this.ay = ay;
                this.bx = bx;
                this.by = by;
                this.ox = ox;
                this.oy = oy;
            }
            Matrix3x2.prototype.clone = function () { return new Matrix3x2(this.ax, this.ay, this.bx, this.by, this.ox, this.oy); };
            Object.defineProperty(Matrix3x2, "identity", {
                get: function () { return new Matrix3x2(1, 0, 0, 1, 0, 0); },
                enumerable: true,
                configurable: true
            });
            Matrix3x2.translate = function (dx, dy) { return new Matrix3x2(1, 0, 0, 1, dx, dy); };
            Matrix3x2.rotate = function (radians) { var cos = Math.cos(radians); var sin = Math.sin(radians); return new Matrix3x2(cos, sin, -sin, cos, 0, 0); };
            Matrix3x2.scale = function (sx, sy) {
                if (sy === void 0) { sy = sx; }
                return new Matrix3x2(sx, 0, 0, sy, 0, 0);
            };
            Matrix3x2.prototype.translate = function (dx, dy) { return Matrix3x2.mul(this, Matrix3x2.translate(dx, dy)); };
            Matrix3x2.prototype.rotate = function (radians) { return Matrix3x2.mul(this, Matrix3x2.rotate(radians)); };
            Matrix3x2.prototype.scale = function (sx, sy) {
                if (sy === void 0) { sy = sx; }
                return Matrix3x2.mul(this, Matrix3x2.scale(sx, sy));
            };
            Matrix3x2.mul = function () {
                var matricies = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    matricies[_i - 0] = arguments[_i];
                }
                if (matricies.length === 0)
                    return Matrix3x2.identity;
                if (matricies.length === 1)
                    return matricies[0].clone(); // 
                var _a = matricies[0], ax = _a.ax, ay = _a.ay, bx = _a.bx, by = _a.by, ox = _a.ox, oy = _a.oy;
                for (var i = 1; i < matricies.length; ++i) {
                    var r = matricies[i];
                    // "every row" dot "every column"
                    var row0 = [ax, bx, ox];
                    var row1 = [ay, by, oy];
                    var col0 = [r.ax, r.ay, 0];
                    var col1 = [r.bx, r.by, 0];
                    var col2 = [r.ox, r.oy, 1];
                    ax = dot(row0, col0);
                    ay = dot(row1, col0);
                    bx = dot(row0, col1);
                    by = dot(row1, col1);
                    ox = dot(row0, col2);
                    oy = dot(row1, col2);
                    // Sanity check "row2" dot "colN"
                    console.assert(dot([0, 0, 1], col0) === 0);
                    console.assert(dot([0, 0, 1], col1) === 0);
                    console.assert(dot([0, 0, 1], col2) === 1);
                }
                return new Matrix3x2(ax, ay, bx, by, ox, oy);
            };
            /** Transforms a point or vector by the full matrix */
            Matrix3x2.prototype.xformPoint = function (xy) {
                var a = xy.x;
                var b = xy.y;
                var x = a * this.ax + b * this.bx + 1 * this.ox;
                var y = a * this.ay + b * this.by + 1 * this.oy;
                return { x: x, y: y };
            };
            /** Slices the last column / pretends we're multiplying by the 2x2 subset of the matrix.  Useful to avoid translating directional vectors, normals, etc. */
            Matrix3x2.prototype.xformNormal = function (xy) {
                var a = xy.x;
                var b = xy.y;
                var x = a * this.ax + b * this.bx; // + 0*this.ox;
                var y = a * this.ay + b * this.by; // + 0*this.oy;
                return { x: x, y: y };
            };
            Matrix3x2.prototype.setContextTransform = function (context) {
                context.setTransform(this.ax, this.ay, this.bx, this.by, this.ox, this.oy); // ?
            };
            return Matrix3x2;
        }());
        tiles.Matrix3x2 = Matrix3x2;
        function dot(l, r) {
            console.assert(l.length === r.length);
            var s = 0;
            for (var i = 0, n = l.length; i < n; ++i)
                s += l[i] * r[i];
            return s;
        }
        function unitTests() {
            var approxLimit = 0.001;
            function approxEqualXY(a, b) { return Math.abs(a.x - b.x) < approxLimit && Math.abs(a.y - b.y) < approxLimit; }
            function assertApproxEqualXY(a, b) { console.assert(approxEqualXY(a, b), "should be equal:\n\tA =", a, "\n\tB =", b); }
            var rot90 = Matrix3x2.rotate(Math.PI / 2);
            assertApproxEqualXY(Matrix3x2.identity.xformPoint(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.identity.xformNormal(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.rotate(Math.PI).xformPoint(tiles.xy(2, 3)), tiles.xy(-2, -3));
            assertApproxEqualXY(Matrix3x2.rotate(Math.PI).xformNormal(tiles.xy(2, 3)), tiles.xy(-2, -3));
            assertApproxEqualXY(Matrix3x2.rotate(2 * Math.PI).xformPoint(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.rotate(2 * Math.PI).xformNormal(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.rotate(Math.PI / 2).rotate(Math.PI / 2).rotate(Math.PI / 2).rotate(Math.PI / 2).xformPoint(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.rotate(-Math.PI / 2).rotate(-Math.PI / 2).rotate(-Math.PI / 2).rotate(-Math.PI / 2).xformPoint(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.mul(rot90, rot90, rot90, rot90).xformPoint(tiles.xy(2, 3)), tiles.xy(2, 3));
            assertApproxEqualXY(Matrix3x2.scale(3).xformPoint(tiles.xy(2, 3)), tiles.xy(6, 9));
            assertApproxEqualXY(Matrix3x2.scale(-1).xformPoint(tiles.xy(2, 3)), tiles.xy(-2, -3));
            assertApproxEqualXY(Matrix3x2.scale(-1, -1).xformPoint(tiles.xy(2, 3)), tiles.xy(-2, -3));
            assertApproxEqualXY(Matrix3x2.scale(-1, -1).xformNormal(tiles.xy(2, 3)), tiles.xy(-2, -3));
            assertApproxEqualXY(Matrix3x2.translate(1, 5).xformPoint(tiles.xy(2, 3)), tiles.xy(3, 8));
            assertApproxEqualXY(Matrix3x2.translate(1, 5).xformNormal(tiles.xy(2, 3)), tiles.xy(2, 3));
        }
        addEventListener("load", unitTests);
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        function xy(x, y) { return { x: x, y: y }; }
        tiles.xy = xy;
        function size(w, h) { return { w: w, h: h }; }
        tiles.size = size;
        function rect(x, y, w, h) { return { x: x, y: y, w: w, h: h }; }
        tiles.rect = rect;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
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
var mmk;
(function (mmk) {
    var tiles;
    (function (tiles) {
        function isLoaded(img) { return img.complete && img.naturalHeight !== 0; }
        function createSpriteRendererImgPixels(img, sx, sy, sw, sh) {
            var renderer = {
                drawToContext: function (context, cx, cy, cw, ch) { },
            };
            var onLoad = function () {
                var imgW = img.naturalWidth;
                var imgH = img.naturalHeight;
                console.assert(sx <= imgW);
                console.assert(sx + sw <= imgW);
                console.assert(sy <= imgH);
                console.assert(sy + sh <= imgH);
                renderer.drawToContext = function (context, cx, cy, cw, ch) { context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch); };
            };
            if (isLoaded(img))
                onLoad(); // don't bother with the callback
            else {
                img.addEventListener("load", onLoad);
                if (isLoaded(img))
                    onLoad(); // loaded while registering callback?
            }
            return renderer;
        }
        tiles.createSpriteRendererImgPixels = createSpriteRendererImgPixels;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
//# sourceMappingURL=mmk.tiles.js.map