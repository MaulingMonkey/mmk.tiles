# mmk.tiles

MaulingMonkey's typescript tile rendering/picking/management API.

Currently supports:

* Subdividing spritesheets from JSON data
* Basic rendering of translated and rotated dense rectangular tilemaps
* Basic picking for translated and rotated dense rectangular tilemaps

License: [Apache 2.0](LICENSE.txt)

## Basic API

See [src/_demo.ts](src/_demo.ts)

```typescript
// TODO (finalize high level APIs first?)
```

## Installation

### Via NuGet
* <strike>Add [mmk.tiles](https://www.nuget.org/packages/mmk.tiles/) to your project via nuget.</strike> **Soon (tm)**
* Reference `<script src="Scripts/mmk.tiles/mmk.tiles.js"></script>` on your page.
* Done!



## Browser Support

| Browser    | API(s)   | Bench [1] | Bench [2] |
| ---------- | -------- | --------- | --------- |
| FireFox 53 | Canvas2D |  ~7ms     |           |
| Opera 44   | Canvas2D | ~13ms     |           |
| Chrome 59  | Canvas2D | ~13ms     | ~20ms     |
| IE 11      | Canvas2D | ~14ms     | ~16ms     |
| Edge       | Canvas2D |           | ~16ms     |

1. "Total" figures from the demo on Machine 1
2. "Total" figures from the demo on Machine 2

Benchmarks last updated @ https://github.com/MaulingMonkey/mmk.tiles/commit/4747016ce20ac92bda4c91715c03f9b47b79165f .  Note that the benchmark averages were eyeballed (shock! horror!), cpu speed not well controlled, etc. - take it with a grain of salt.

### Benchmarking Hardware

| Component    | Machine 1                   | Machine 2                   |
| ------------ | --------------------------- | --------------------------- |
| Build        | Custom                      | [Samsung ATIV Book 9](https://www.amazon.com/Samsung-NP940X3G-K04US-13-3-Inch-Touchscreen-Processor/dp/B00F6EOB8C) |
| OS           | Windows 7 Professional      | Windows 10 Home             |
| CPU          | 3.5 GHz Intel Core i7-5930K | 1.8 GHz Intel Core i7-4500U |
| Actual Speed | ~3.6 GHz                    | ~ 2.4 - 2.7 GHz             |
| GPU          | nVidia GeForce GTX 970      | Intel HD Graphics 4400      |






## TODO

* Finish adding higher level APIs
  * Add a sparse tile renderer
  * Make renderers more stateful with regards to transform/target for ease of use and ability to make data driven
* Benchmark improvements:
  * Frame times
  * Smooth/debounce results
  * d3 based for selectable text?
* Optimize
  * Check dirty tiles
  * Scrolling blits when resizing canvas
* Figure out how to prevent sinclair from tainting this codebase with modules
