#!/usr/bin/env python3
"""
Optimise source images into the responsive web assets this site expects.

For every input image it writes four files next to each other:
    name.jpg, name.webp            (large,  ~1800px)
    name-thumb.jpg, name-thumb.webp (thumb, ~760px)

...and (re)generates src/lib/image-dimensions.json with the intrinsic large
dimensions of every /images/**.jpg so the <ResponsiveImage> component can set
width/height and avoid layout shift.

Usage
-----
    pip install pillow
    # Drop full-res images into a working folder, then:
    python scripts/optimize-images.py <input_dir> <slug> [--kind gallery|plans]
    # e.g.
    python scripts/optimize-images.py ~/renders/new-house new-house

Then record any new files' dimensions by re-running with --reindex only:
    python scripts/optimize-images.py --reindex
"""
import argparse, json, os, sys, glob
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
LARGE_W, THUMB_W, Q = 1800, 760, 82


def save_set(im, dest_dir, name):
    im = ImageOps.exif_transpose(im).convert("RGB")
    w, h = im.size
    os.makedirs(dest_dir, exist_ok=True)
    lw = min(LARGE_W, w)
    lg = im.resize((lw, round(h * lw / w)), Image.LANCZOS)
    lg.save(f"{dest_dir}/{name}.jpg", "JPEG", quality=Q, optimize=True, progressive=True)
    lg.save(f"{dest_dir}/{name}.webp", "WEBP", quality=Q, method=6)
    tw = min(THUMB_W, w)
    tb = im.resize((tw, round(h * tw / w)), Image.LANCZOS)
    tb.save(f"{dest_dir}/{name}-thumb.jpg", "JPEG", quality=80, optimize=True, progressive=True)
    tb.save(f"{dest_dir}/{name}-thumb.webp", "WEBP", quality=80, method=6)
    print(f"  {name}: {lw}x{round(h * lw / w)}")


def reindex():
    """Rebuild src/lib/image-dimensions.json from the optimised JPGs."""
    out = {}
    base = os.path.join(PUBLIC, "images")
    for f in glob.glob(os.path.join(base, "**", "*.jpg"), recursive=True):
        if f.endswith("-thumb.jpg"):
            continue
        rel = "/images/" + os.path.relpath(f, base).replace(os.sep, "/")
        with Image.open(f) as im:
            out[rel] = {"w": im.size[0], "h": im.size[1]}
    dest = os.path.join(ROOT, "src", "lib", "image-dimensions.json")
    json.dump(out, open(dest, "w"), indent=0, sort_keys=True)
    print(f"Wrote {len(out)} entries to {dest}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input_dir", nargs="?", help="folder of source images")
    ap.add_argument("slug", nargs="?", help="project slug")
    ap.add_argument("--kind", default="gallery", choices=["gallery", "plans"])
    ap.add_argument("--reindex", action="store_true", help="only rebuild the dimensions JSON")
    args = ap.parse_args()

    if args.reindex or not args.input_dir:
        reindex()
        return

    dest = os.path.join(PUBLIC, "images", "projects", args.slug, args.kind)
    exts = ("*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG")
    files = sorted(f for e in exts for f in glob.glob(os.path.join(args.input_dir, e)))
    if not files:
        sys.exit(f"No images found in {args.input_dir}")
    print(f"Optimising {len(files)} images -> {dest}")
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0].lower().replace(" ", "-")
        with Image.open(f) as im:
            save_set(im, dest, name)
    reindex()


if __name__ == "__main__":
    main()
