# [WIP][Experimental] Out-of-Order Renderer for PixiJS Scene Graphs

This packages provides an out-of-order batch renderer, which:

* can improve batching efficiency by smartly re-ordering your display-object renders
to minimize draw calls. This can be done because display-objects that do not intersect
in world space do not need to be rendered in-order.

* does not need to prematurely flush when a filtered or masked
display-object is encountered, unlike Pixi's in-built batch renderer. Instead of doing
a full-flush, this renderer will only flush the display objects that intersect with
the filtered/masked one.

## How it works

Each batched display-object is assigned a:

* layer-ID: Overlapping display-objects must be be rendered in-order. The layer-ID is incremented whenever a display-objects
happens to overlap another one before it.

* batch-ID: Display-objects that have the same rendering dependencies (like textures or uniforms) have the same batch-ID.

When the display-object is queued, it is placed in a bucket for its batch-ID. This bucket keeps display-objects sorted in
order of their layer-ID.

When the batch renderer is flushed, then buckets are merged to form batches. Merging is done such that layer-ID ordering is
preserved and batch size is evenly distributed. Depending on the user's GPU, there is a "set" number of buckets per batch.

## Basic Usage

The following example will setup a built-in preset of the out-of-order renderer:

```js
import * as PIXI from 'pixi.js;
import { createOooable, OooRendererPluginFactory } from 'pixi-ooo-renderer';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';

// Create a sprite that will render using the ooo-renderer instead of
// default batching mechanism in PixiJS.
//
// createOooable prevents premature flushing when filtered. It does not
// need to be used but is recommended for maximizing performance.
function createOooSprite(textureOrUrl) {
    const sprite = createOooable(typeof textureOrUrl === 'string' 
        ? PIXI.Sprite.from(textureOrUrl) 
        : new PIXI.Sprite(textureOrUrl));

    sprite.pluginName = 'ooo';
    return sprite;
}

// Register out-of-order renderer plugin. The default preset was made
// for rendering Sprite, Mesh, Graphics (PixiJS built-in display-object).
//
// For custom-tailored display objects, you can use the OooRendererPluginFactory
// API to define your own rendering pipeline.
PIXI.Renderer.registerPlugin('ooo', OooRendererPluginFactory.create({
    preset: 'built-in'    
}))

const app = new PIXI.Application({ /* options */ });

app.stage.addChild(createOooSprite('./assets/foo.png'));

// This won't prevent 1st and 3rd sprite from getting batched because
// it is placed at (100, 350), far away.
const spriteWithFilters = createOooSprite('./assets/foobar.png');
spriteWithFilters.filters = [new DropShadowFilter()];
spriteWithFilters.position.set(100, 350);
app.stage.addChild(spriteWithFilters);

app.stage.addChild(createOooSprite('./assets/bar.png));
```