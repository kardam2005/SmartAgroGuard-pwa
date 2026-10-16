import os
import math
from PIL import Image, ImageDraw, ImageFont

icons_dir = r"d:\sem 7\p\newPROJECT\front_progressive_webapp\public\icons"
os.makedirs(icons_dir, exist_ok=True)

def draw_agroguard_icon(size, is_maskable=False, is_badge=False):
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = size * 0.15 if is_maskable else size * 0.04
    w = size - 2 * margin
    h = size - 2 * margin
    cx = size / 2
    cy = size / 2

    if not is_badge:
        # Background rounded rect or circle with lush green-emerald gradient
        steps = int(size)
        for i in range(steps):
            t = i / steps
            # Gradient from deep dark slate green (10, 25, 20) to vibrant emerald (16, 185, 129)
            r = int(10 + t * (5 - 10))
            g = int(35 + t * (120 - 35))
            b = int(30 + t * (80 - 30))
            # draw subtle background shape
            radius = size * 0.22 if not is_maskable else 0
            # For simplicity, base background
        
        bg_radius = int(size * 0.22) if not is_maskable else 0
        draw.rounded_rectangle([0, 0, size, size], radius=bg_radius, fill=(11, 28, 22, 255))
        
        # Inner glowing shield/leaf ring
        glow_box = [margin, margin, size - margin, size - margin]
        draw.rounded_rectangle(glow_box, radius=int(size * 0.18), outline=(16, 185, 129, 200), width=max(2, int(size * 0.025)))

        # Draw stylized Leaf & Corn Plant
        # Left Leaf (Emerald Green)
        leaf_pts = [
            (cx, cy + h * 0.38),
            (cx - w * 0.35, cy + h * 0.15),
            (cx - w * 0.38, cy - h * 0.18),
            (cx, cy - h * 0.38),
            (cx - w * 0.08, cy - h * 0.05),
            (cx, cy + h * 0.38)
        ]
        draw.polygon(leaf_pts, fill=(16, 185, 129, 240))

        # Right Leaf / Golden Corn Sprout
        right_leaf_pts = [
            (cx, cy + h * 0.38),
            (cx + w * 0.35, cy + h * 0.12),
            (cx + w * 0.38, cy - h * 0.15),
            (cx, cy - h * 0.38),
            (cx + w * 0.06, cy - h * 0.02),
            (cx, cy + h * 0.38)
        ]
        draw.polygon(right_leaf_pts, fill=(52, 211, 153, 230))

        # Central Golden Sprout (Golden Ear of Corn / Sensor Node)
        center_pts = [
            (cx, cy - h * 0.42),
            (cx + w * 0.12, cy - h * 0.10),
            (cx + w * 0.08, cy + h * 0.25),
            (cx - w * 0.08, cy + h * 0.25),
            (cx - w * 0.12, cy - h * 0.10),
        ]
        draw.polygon(center_pts, fill=(245, 158, 11, 255)) # Warm Gold

        # Stem line
        draw.line([(cx, cy - h * 0.42), (cx, cy + h * 0.38)], fill=(255, 255, 255, 220), width=max(2, int(size * 0.02)))

        # Little Tech/AI Circles (Precision Agriculture)
        node_radius = max(3, int(size * 0.035))
        # Top apex
        draw.ellipse([cx - node_radius, cy - h * 0.42 - node_radius, cx + node_radius, cy - h * 0.42 + node_radius], fill=(255, 255, 255, 255), outline=(16, 185, 129, 255), width=2)
        # Left wing node
        draw.ellipse([cx - w * 0.30 - node_radius, cy - h * 0.10 - node_radius, cx - w * 0.30 + node_radius, cy - h * 0.10 + node_radius], fill=(52, 211, 153, 255))
        # Right wing node
        draw.ellipse([cx + w * 0.30 - node_radius, cy - h * 0.08 - node_radius, cx + w * 0.30 + node_radius, cy - h * 0.08 + node_radius], fill=(251, 191, 36, 255))

    else:
        # Monochrome badge icon
        draw.ellipse([margin, margin, size - margin, size - margin], fill=(255, 255, 255, 255))
        draw.polygon([(cx, cy - h * 0.35), (cx - w * 0.25, cy + h * 0.2), (cx + w * 0.25, cy + h * 0.2)], fill=(0, 0, 0, 255))

    return img

sizes = [
    (192, "icon-192x192.png", False, False),
    (512, "icon-512x512.png", False, False),
    (192, "icon-maskable-192x192.png", True, False),
    (512, "icon-maskable-512x512.png", True, False),
    (180, "apple-touch-icon.png", False, False),
    (64, "favicon.png", False, False),
    (72, "badge-72x72.png", False, True),
]

for s, filename, maskable, badge in sizes:
    filepath = os.path.join(icons_dir, filename)
    img = draw_agroguard_icon(s, is_maskable=maskable, is_badge=badge)
    img.save(filepath, "PNG")
    print(f"Generated {filepath} ({s}x{s})")

print("All PWA icons generated successfully!")
