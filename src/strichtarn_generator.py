#!/usr/bin/env python3
# by GPT-5.3-codex medium
"""Generate a deterministic alpha strichtarn PNG pattern."""

from __future__ import annotations

import argparse
import hashlib
import os
import random
from pathlib import Path

from PIL import Image, ImageDraw

BG = (0, 0, 0, 0)
LINE = (0, 0, 0, 10)
WIDTH = 512
HEIGHT = 512
GRID_STEP = 4


def seed_from_basename(path: str) -> int:
    basename = os.path.basename(path)
    digest = hashlib.sha256(basename.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big", signed=False)


def pattern_params(seed: int) -> tuple[bool, int, int, int, int, int, int]:
    rng = random.Random(seed ^ 0x94D049BB133111EB)
    horizontal = (seed & 1) == 0
    column_step_slots = rng.choice((2, 3, 4, 5, 6))
    line_width = rng.choice((1, 1, 2, 2, 3, 4))
    run_len = rng.randint(12, 46)
    gap_len = rng.randint(4, 22)
    x_phase = rng.randrange(column_step_slots)
    y_phase = rng.randint(0, run_len + gap_len - 1)
    return horizontal, column_step_slots, line_width, run_len, gap_len, x_phase, y_phase


def build_phase_offsets(seed: int, count: int, period: int) -> list[int]:
    """Seeded short-period linear phase offsets."""
    if count <= 0:
        return []

    rng = random.Random(seed ^ 0x2545F4914F6CDD1D)
    pattern_period = rng.randint(2, 6)
    phase = rng.randrange(pattern_period)
    slope_limit = max(1, period // (pattern_period * 2))
    slope = rng.choice((-1, 1)) * rng.randint(1, slope_limit)
    base = rng.randrange(period)

    offsets: list[int] = []
    for i in range(count):
        t = (i + phase) % pattern_period
        offsets.append((base + slope * t) % period)
    return offsets


def generate_strichtarn(seed: int, width: int, height: int) -> Image.Image:
    img = Image.new("RGBA", (width, height), BG)
    draw = ImageDraw.Draw(img)

    horizontal, step_slots, line_width, run_len, gap_len, x_phase, y_phase = pattern_params(seed)
    slots = max(1, (height if horizontal else width) // GRID_STEP)
    lines = [slot for slot in range(slots) if (slot - x_phase) % step_slots == 0]
    period = run_len + gap_len
    phase_offsets = build_phase_offsets(seed, len(lines), period)

    for idx, slot in enumerate(lines):
        fixed_axis = slot * GRID_STEP
        start = -((y_phase + phase_offsets[idx]) % period)

        while start < (width if horizontal else height):
            start += gap_len
            if start >= (width if horizontal else height):
                break

            if horizontal:
                x1 = start
                y1 = fixed_axis
                x2 = min(width - 1, start + run_len - 1)
                y2 = min(height - 1, fixed_axis + line_width - 1)
            else:
                x1 = fixed_axis
                y1 = start
                x2 = min(width - 1, fixed_axis + line_width - 1)
                y2 = min(height - 1, start + run_len - 1)

            draw.rectangle((x1, y1, x2, y2), fill=LINE)
            start += run_len

    return img


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Generate an alpha strichtarn pattern PNG at the given path. "
            "Orientation and pattern parameters are deterministically seeded from basename(output_path)."
        )
    )
    parser.add_argument("output", help="Output PNG filename")
    args = parser.parse_args()

    output = Path(args.output)
    if output.parent != Path("."):
        output.parent.mkdir(parents=True, exist_ok=True)

    seed = seed_from_basename(str(output))
    img = generate_strichtarn(seed, WIDTH, HEIGHT)
    img.save(output, format="PNG")


if __name__ == "__main__":
    main()
