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
        function eachFrame(onFrame) {
            var callback;
            callback = function () {
                requestAnimationFrame(callback);
                onFrame();
            };
            callback();
        }
        tiles.eachFrame = eachFrame;
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
    (function (tiles_1) {
        addEventListener("load", function () {
            var demo = document.getElementById("mmk-tiles-demo");
            if (!demo)
                return;
            console.assert(demo.tagName === "CANVAS");
            var imgSrc = demo.getAttribute("data-mmk-tilemap");
            var img = document.createElement("img");
            var tileMap = {
                "wallTop": tiles_1.createSpriteRendererImgPixels(img, 0, 0, 16, 16),
                "wallBottom": tiles_1.createSpriteRendererImgPixels(img, 0, 16, 16, 16),
                "floorDot": tiles_1.createSpriteRendererImgPixels(img, 0, 32, 16, 16),
                "floorX": tiles_1.createSpriteRendererImgPixels(img, 0, 48, 16, 16),
                "floorBlank": tiles_1.createSpriteRendererImgPixels(img, 16, 32, 16, 16),
                "selectTile": tiles_1.createSpriteRendererImgPixels(img, 16, 0, 16, 16),
                "selectDot": tiles_1.createSpriteRendererImgPixels(img, 16, 16, 16, 16),
            };
            img.addEventListener("load", function () {
                // Redraw the whole universe
                var w = demo.clientWidth = demo.width;
                var h = demo.clientHeight = demo.height;
                var tileW = 16;
                var tileH = 16;
                var worldH = h / 16;
                var worldW = w / 16;
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
                function eachTile(onTile) {
                    for (var y = 0; y < worldH; ++y)
                        for (var x = 0; x < worldW; ++x) {
                            var tiles_2 = getTile(x, y);
                            for (var iTile = 0; iTile < tiles_2.length; ++iTile) {
                                onTile(tiles_2[iTile], x * tileW, y * tileH);
                            }
                        }
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
                    var cached = true;
                    var blit = true;
                    if (cached) {
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
                    }
                    else if (blit) {
                        var context = demo.getContext("2d");
                        if (imgData === undefined || imgData.width !== w || imgData.height !== h)
                            imgData = new ImageData(w, h);
                        eachTile(function (sr, x, y) { sr.drawToImageData(imgData, x, y, tileW, tileH); });
                        context.putImageData(imgData, 0, 0, 0, 0, w, h);
                    }
                    else {
                        var context_1 = demo.getContext("2d");
                        eachTile(function (sr, x, y) { sr.drawToContext(context_1, x, y, tileW, tileH); });
                    }
                    var end = Date.now();
                    tiles_1.benchmark("---------------------------", 0);
                    tiles_1.benchmark("Total", end - start);
                });
            });
            img.src = imgSrc;
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
                this.imageData = new ImageData(1, 1);
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
                if (this.imageData === undefined) {
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
                            for (var i = 0; i < sprites.length; ++i)
                                sprites[i].drawToContext(context, tilePixelX, tilePixelY, tileW, tileH);
                        }
                }
                else {
                    this.ensureCanvasSizeTiles(this.canvas, maxTileX - minTileX + 1, maxTileY - minTileY + 1);
                    if (this.imageData.width < this.canvas.width || this.imageData.height < this.canvas.height)
                        this.imageData = new ImageData(Math.max(this.imageData.width, this.canvas.width), Math.max(this.imageData.height, this.canvas.height));
                    //if (this.imageData.width !== this.canvas.width || this.imageData.height !== this.canvas.height) this.imageData = new ImageData(this.canvas.width, this.canvas.height);
                    var imageData = this.imageData;
                    imageData.data.fill(0, 0, imageData.data.length);
                    for (var tileDy = 0; tileDy < tilesTall; ++tileDy)
                        for (var tileDx = 0; tileDx < tilesWide; ++tileDx) {
                            var tileX = tileDx + minTileX;
                            var tileY = tileDy + minTileY;
                            var tilePixelX = tileDx * tileW;
                            var tilePixelY = tileDy * tileH;
                            var sprites = getTile(tileX, tileY);
                            for (var i = 0; i < sprites.length; ++i)
                                sprites[i].drawToImageData(imageData, tilePixelX, tilePixelY, tileW, tileH);
                        }
                    this.canvas.getContext("2d").putImageData(this.imageData, 0, 0);
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
        function isCompletelyOpaque(imgData) {
            var d = imgData.data;
            var n = 4 * imgData.width * imgData.height;
            console.assert(n <= imgData.data.length);
            // Bytewise component order: [R, G, B, A, ...]
            var pixelOffsetA = 3;
            var pixelStride = 4;
            for (var o = pixelOffsetA; o < n; o += pixelStride)
                if (d[o] !== 0xFF)
                    return false;
            return true;
        }
        function isCompletelyOpaqueWithin(imgData, sx, sy, sw, sh) {
            // TODO: Clip
            var d = imgData.data;
            var dW = imgData.width;
            for (var dy = 0; dy < sh; ++dy) {
                var iAlpha = 3 + 4 * (sx + dW * (sy + dy));
                for (var dx = 0; dx < sw; ++dx) {
                    if (d[iAlpha] !== 0xFF)
                        return false;
                    iAlpha += 4;
                }
            }
            return true;
        }
        function fillClip(dst, color) {
            var dst0 = new Uint32Array(dst.data.buffer);
            var dstW = dst.width;
            var dstH = dst.height;
            var dstN = dstW * dstH;
            for (var i = 0; i < dstN; ++i)
                dst0[i] = color;
        }
        function opaqueBlitNoClip(dst, src, dstX, dstY, srcX, srcY, w, h) {
            var dst0 = new Uint32Array(dst.data.buffer);
            var src0 = new Uint32Array(src.data.buffer);
            var dstW = dst.width;
            var srcW = src.width;
            for (var y = 0; y < h; ++y) {
                var dstI = (dstX + dstW * (dstY + y));
                var srcI = (srcX + srcW * (srcY + y));
                for (var x = 0; x < w; ++x)
                    dst0[dstI++] = src0[srcI++]; // RGBA
            }
        }
        function opaqueBlit(dst, src, dstX, dstY, srcX, srcY, w, h) {
            var dstW = dst.width;
            var dstH = dst.height;
            var srcW = src.width;
            var srcH = src.height;
            // Clip
            if (dstX < 0) {
                w += dstX;
                srcX -= dstX;
                dstX = 0;
            }
            if (dstY < 0) {
                h += dstY;
                srcY -= dstY;
                dstY = 0;
            }
            if (srcX < 0) {
                w += srcX;
                dstX -= srcX;
                srcX = 0;
            }
            if (srcY < 0) {
                h += srcY;
                dstY -= srcY;
                srcY = 0;
            }
            if (dstX + w > dstW)
                w = dstX - dstW;
            if (dstY + h > dstH)
                h = dstY - dstH;
            if (srcX + w > srcW)
                w = srcX - srcW;
            if (srcY + h > srcH)
                h = srcY - srcH;
            if (w < 0 || h < 0)
                return;
            opaqueBlitNoClip(dst, src, dstX, dstY, srcX, srcY, w, h);
        }
        function transparentBlitNoClip(dst, src, dstX, dstY, srcX, srcY, w, h) {
            var dst0 = dst.data;
            var src0 = src.data;
            var dstW = dst.width;
            var srcW = src.width;
            for (var y = 0; y < h; ++y) {
                var dstI = 4 * (dstX + dstW * (dstY + y));
                var srcI = 4 * (srcX + srcW * (srcY + y));
                for (var x = 0; x < w; ++x) {
                    var srcR = src0[srcI++];
                    var srcG = src0[srcI++];
                    var srcB = src0[srcI++];
                    var srcA = src0[srcI++];
                    var dstR = dst0[dstI + 0];
                    var dstG = dst0[dstI + 1];
                    var dstB = dst0[dstI + 2];
                    var dstA = dst0[dstI + 3];
                    // Fustratingly, ImageData uses *non*-premultiplied alpha.
                    var dstA_invSrcA_01 = dstA * (255 - srcA) / 255;
                    var srcA_01 = srcA / 255;
                    dst0[dstI++] = ((dstR * dstA_invSrcA_01 / 255) | 0) + ((srcR * srcA_01) | 0); // R
                    dst0[dstI++] = ((dstG * dstA_invSrcA_01 / 255) | 0) + ((srcG * srcA_01) | 0); // G
                    dst0[dstI++] = ((dstB * dstA_invSrcA_01 / 255) | 0) + ((srcB * srcA_01) | 0); // B
                    dst0[dstI++] = ((dstA_invSrcA_01) | 0) + ((srcA) | 0); // A
                }
            }
        }
        function transparentBlit(dst, src, dstX, dstY, srcX, srcY, w, h) {
            var dstW = dst.width;
            var dstH = dst.height;
            var srcW = src.width;
            var srcH = src.height;
            // Clip
            if (dstX < 0) {
                w += dstX;
                srcX -= dstX;
                dstX = 0;
            }
            if (dstY < 0) {
                h += dstY;
                srcY -= dstY;
                dstY = 0;
            }
            if (srcX < 0) {
                w += srcX;
                dstX -= srcX;
                srcX = 0;
            }
            if (srcY < 0) {
                h += srcY;
                dstY -= srcY;
                srcY = 0;
            }
            if (dstX + w > dstW)
                w = dstX - dstW;
            if (dstY + h > dstH)
                h = dstY - dstH;
            if (srcX + w > srcW)
                w = srcX - srcW;
            if (srcY + h > srcH)
                h = srcY - srcH;
            if (w < 0 || h < 0)
                return;
            transparentBlitNoClip(dst, src, dstX, dstY, srcX, srcY, w, h);
        }
        function createSpriteRendererImgPixels(img, sx, sy, sw, sh) {
            var renderer = {
                drawToContext: function (context, cx, cy, cw, ch) { },
                drawToImageData: function (imageData, cx, cy, cw, ch) { },
                drawToImageDataNoClip: function (imageData, cx, cy, cw, ch) { },
            };
            var onLoad = function () {
                var imgW = img.naturalWidth;
                var imgH = img.naturalHeight;
                console.assert(sx <= imgW);
                console.assert(sx + sw <= imgW);
                console.assert(sy <= imgH);
                console.assert(sy + sh <= imgH);
                var canvas = document.createElement("canvas");
                canvas.width = canvas.clientWidth = imgW;
                canvas.height = canvas.clientHeight = imgH;
                var imgDataContext = canvas.getContext("2d");
                imgDataContext.drawImage(img, 0, 0, imgW, imgH, 0, 0, imgW, imgH);
                // TODO: "Try" in case of CORS, older browser, etc.?
                var imgData = imgDataContext.getImageData(0, 0, imgW, imgH);
                var isOpaque = !!imgData && isCompletelyOpaqueWithin(imgData, sx, sy, sw, sh);
                renderer.drawToContext = function (context, cx, cy, cw, ch) { context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch); };
                if (!imgData)
                    renderer.drawToImageData = undefined;
                else if (isOpaque)
                    renderer.drawToImageData = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); opaqueBlit(dst, imgData, cx, cy, sx, sy, sw, sh); };
                else
                    renderer.drawToImageData = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); transparentBlit(dst, imgData, cx, cy, sx, sy, sw, sh); };
                if (!imgData)
                    renderer.drawToImageDataNoClip = undefined;
                else if (isOpaque)
                    renderer.drawToImageDataNoClip = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); opaqueBlitNoClip(dst, imgData, cx, cy, sx, sy, sw, sh); };
                else
                    renderer.drawToImageDataNoClip = function (dst, cx, cy, cw, ch) { console.assert(cw === sw); console.assert(ch === sh); transparentBlitNoClip(dst, imgData, cx, cy, sx, sy, sw, sh); };
            };
            img.addEventListener("load", onLoad);
            return renderer;
        }
        tiles.createSpriteRendererImgPixels = createSpriteRendererImgPixels;
    })(tiles = mmk.tiles || (mmk.tiles = {}));
})(mmk || (mmk = {}));
//# sourceMappingURL=mmk.tiles.js.map