# Retro personal-web reference study

Research date: 2026-10-02. This is a structural/design analysis of publicly delivered pages, not a redistribution of their code or artwork.

## Shared traits

- The page is a place before it is a component library.
- A dominant original artwork determines the layout, palette, and navigation metaphor.
- Text density comes from labels, captions, counters, warnings, microcopy, badges, and personal updates—not from filling every space with decoration.
- JavaScript is secondary. The memorable layer is art direction, asset selection, image composition, and spatial linking.
- Utility typefaces are mixed with one expressive voice, while color roles stay surprisingly disciplined.

## NEØNbandit Street

The entry page is a full-screen illustrated environment with a warning/player window laid over the scene. Public DOM inspection showed one stylesheet, four small named scripts plus one inline script, and a compact document tree. The visual complexity is therefore asset-led rather than component-led. Useful pattern: **windowed broadcast**. Do not copy its neon road, typography, character branding, or music behavior.

## K.D. Kemp

The home page uses a desk as an image map assembled from many separate raster objects. Public DOM inspection found 33 images and 28 links; the primary desk image is supplemented by drawers, monitor, tower, camera, books, boombox, perfume, cup, typewriter, notes, and social badges. Useful pattern: **spatial object map** with real object cutouts and large transparent images. Its value is the editorial selection and physical metaphor, not advanced scripting.

## ESPY.WORLD

The page uses one tall central character/machine, mirrored side navigation, small supporting icons, and webring panels. Public DOM inspection found two stylesheets, one external utility script plus inline scripts, 28 images, and 38 links. Useful pattern: **central figure with satellites**. The limited black/chartreuse/magenta/blue palette keeps a very dense composition coherent.

## Applied direction for this project

The resulting site uses a single spatial object map: an original night-desk scene whose tapes, books, cat, star chart, radio stack, disc, photographs, and mail area act as navigation. The central CRT is the only content window. This deliberately avoids the modern landing-page pattern of hero + card grid + about section. All labels and page copy remain live HTML, while the scene itself is an original generated raster asset.
