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
        addEventListener("load", function () {
            var demo = document.getElementById("mmk-tiles-demo");
            if (!demo)
                return;
            console.assert(demo.tagName === "CANVAS");
            var imgSrc = demo.getAttribute("data-mmk-tilemap");
            var img = document.createElement("img");
            var tileMap = {
                "wallTop": tiles.createSpriteRendererImgPixels(img, 0, 0, 16, 16),
                "wallBottom": tiles.createSpriteRendererImgPixels(img, 0, 16, 16, 16),
                "floorDot": tiles.createSpriteRendererImgPixels(img, 0, 32, 16, 16),
                "floorX": tiles.createSpriteRendererImgPixels(img, 0, 48, 16, 16),
                "floorBlank": tiles.createSpriteRendererImgPixels(img, 16, 32, 16, 16),
                "selectTile": tiles.createSpriteRendererImgPixels(img, 16, 0, 16, 16),
                "selectDot": tiles.createSpriteRendererImgPixels(img, 16, 16, 16, 16),
            };
            img.addEventListener("load", function () {
                var imgData;
                tiles.eachFrame(function () {
                    // Redraw the whole universe
                    var w = demo.clientWidth = demo.width;
                    var h = demo.clientHeight = demo.height;
                    var context = demo.getContext("2d");
                    var tileW = 16;
                    var tileH = 16;
                    var worldH = h / 16;
                    var worldW = w / 16;
                    function eachTile(onTile) {
                        for (var y = 0; y < worldH; ++y)
                            for (var x = 0; x < worldW; ++x) {
                                var top_1 = y === 0;
                                var bot = y === worldH - 1;
                                var left = x === 0;
                                var right = x === worldW - 1;
                                var wall = bot || top_1 || left || right;
                                var bottomWall = wall && (bot || (top_1 && !(left || right)));
                                var tileIds = [];
                                tileIds.push(bottomWall ? "wallBottom" : wall ? "wallTop" : "floorDot");
                                if (x === 3 && y === 3)
                                    tileIds.push("selectTile");
                                if (x === 5 && y === 5)
                                    tileIds.push("selectDot");
                                for (var iTile = 0; iTile < tileIds.length; ++iTile) {
                                    onTile(tileMap[tileIds[iTile]], x * tileW, y * tileH);
                                }
                            }
                    }
                    var blit = true;
                    if (blit) {
                        if (imgData === undefined || imgData.width !== w || imgData.height !== h)
                            imgData = new ImageData(w, h);
                        eachTile(function (sr, x, y) { sr.drawToImageData(imgData, x, y, tileW, tileH); });
                        context.putImageData(imgData, 0, 0, 0, 0, w, h);
                    }
                    else {
                        eachTile(function (sr, x, y) { sr.drawToContext(context, x, y, tileW, tileH); });
                    }
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