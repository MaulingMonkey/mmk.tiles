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
            var demo = document.getElementById("mmk-tiles-demo");
            if (!demo)
                return;
            console.assert(demo.tagName === "CANVAS");
            var imgSrc = demo.getAttribute("data-mmk-tilemap");
            var tileMap = tiles_1.getTileset(imgSrc);
            var w = demo.clientWidth = demo.width;
            var h = demo.clientHeight = demo.height;
            var tileW = 16;
            var tileH = 16;
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
            var renderer = tiles_1.createDenseMapLayerRenderer({
                tileSize: { w: 16, h: 16 },
                getTile: getTile,
            });
            var orientation = {
                target: demo,
                // Top Left
                //targetAnchor: { x: 0, y: 0 }, // Top left of viewport
                //spriteAnchor: { x: 0, y: 0 }, // Top left of sprite
                //focusTile:    { x: 0, y: 0 }, // 0,0 is top left sprite
                // Center
                targetAnchor: { x: 0.5, y: 0.5 },
                spriteAnchor: { x: 0.5, y: 0.5 },
                focusTile: { x: worldW / 2, y: worldH / 2 },
                rotation: Math.cos(Date.now() / 1000) / 10,
                roundPixel: false,
            };
            demo.addEventListener("mousemove", function (ev) {
                mousePixel = { x: ev.offsetX, y: ev.offsetY };
            });
            var imgData;
            tiles_1.eachFrame(function () {
                var start = Date.now();
                var mouseTile = renderer.pixelToTile(orientation, mousePixel);
                curX = Math.round(mouseTile.x);
                curY = Math.round(mouseTile.y);
                tiles_1.benchmark("clear demo", function () {
                    var c = demo.getContext("2d");
                    c.setTransform(1, 0, 0, 1, 0, 0);
                    c.clearRect(0, 0, demo.width, demo.height);
                });
                orientation.rotation = Math.cos(Date.now() / 1000) / 10;
                renderer.render(orientation);
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
        var DenseTileRenderer = (function () {
            function DenseTileRenderer(config) {
                this.config = config;
                this.canvas = document.createElement("canvas");
            }
            DenseTileRenderer.prototype.ensureCanvasSizeTiles = function (canvas, w, h) { return ensureCanvasSizePixels(canvas, this.config.tileSize.w * w, this.config.tileSize.h * h); };
            DenseTileRenderer.prototype.render = function (args) {
                var tStart = Date.now();
                var orient = this.bakeOrientation(args);
                var target = args.target;
                var tileW = this.config.tileSize.w;
                var tileH = this.config.tileSize.h;
                var tl = pixelToTile(orient, { x: 0, y: 0 });
                var tr = pixelToTile(orient, { x: target.width, y: 0 });
                var br = pixelToTile(orient, { x: target.width, y: target.height });
                var bl = pixelToTile(orient, { x: 0, y: target.height });
                var minTileX = Math.round(Math.min(tl.x, tr.x, br.x, bl.x));
                var minTileY = Math.round(Math.min(tl.y, tr.y, br.y, bl.y));
                var maxTileX = Math.round(Math.max(tl.x, tr.x, br.x, bl.x));
                var maxTileY = Math.round(Math.max(tl.y, tr.y, br.y, bl.y));
                var tilesWide = maxTileX - minTileX + 1;
                var tilesTall = maxTileY - minTileY + 1;
                var getTile = this.config.getTile;
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
                    var context = args.target.getContext("2d");
                    context.setTransform(orient.cos, -orient.sin, orient.sin, orient.cos, orient.viewportAnchorX, orient.viewportAnchorY);
                    context.drawImage(this.canvas, orient.tileAnchorX + (minTileX - orient.focusX) * tileW, orient.tileAnchorY + (minTileY - orient.focusY) * tileH, this.canvas.width, this.canvas.height);
                }
                var tEnd = Date.now();
                var prefix = this.config.debugName === undefined ? "" : this.config.debugName + " ";
                tiles.benchmark(prefix + "precalc", tStartRenderToCanvas - tStart);
                tiles.benchmark(prefix + "render to canvas", tStartRenderToTarget - tStartRenderToCanvas);
                tiles.benchmark(prefix + "render to target", tEnd - tStartRenderToTarget);
                tiles.benchmark(prefix + "update benchmarks", Date.now() - tEnd);
            };
            DenseTileRenderer.prototype.pixelToTile = function (args, pixel) {
                var baked = this.bakeOrientation(args);
                return pixelToTile(baked, pixel);
            };
            DenseTileRenderer.prototype.bakeOrientation = function (orient) {
                var target = orient.target;
                var rotation = !orient.rotation ? 0 : orient.rotation;
                var roundPixel = orient.roundPixel === undefined || !!orient.roundPixel; // consider ignoring if rotation isn't a multiple of pi/2 (90deg)
                var viewportAnchorX = target.width * orient.targetAnchor.x;
                var viewportAnchorY = target.height * orient.targetAnchor.y;
                if (roundPixel) {
                    viewportAnchorX = Math.round(viewportAnchorX);
                    viewportAnchorY = Math.round(viewportAnchorY);
                }
                var tileW = this.config.tileSize.w;
                var tileH = this.config.tileSize.h;
                var tileAnchorX = tileW * orient.spriteAnchor.x;
                var tileAnchorY = tileH * orient.spriteAnchor.y;
                if (roundPixel) {
                    tileAnchorX = Math.round(tileAnchorX);
                    tileAnchorY = Math.round(tileAnchorY);
                }
                var cos = Math.cos(rotation);
                var sin = Math.sin(rotation);
                var originX = 0;
                var originY = 0;
                return { cos: cos, sin: sin, viewportAnchorX: viewportAnchorX, viewportAnchorY: viewportAnchorY, tileAnchorX: tileAnchorX, tileAnchorY: tileAnchorY, tileW: tileW, tileH: tileH, focusX: orient.focusTile.x, focusY: orient.focusTile.y };
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