#!/usr/bin/env python3
"""Create simple icons for the browser extension"""
try:
    from PIL import Image, ImageDraw
    import os

    os.makedirs('icons', exist_ok=True)

    # Create a simple musical note icon
    sizes = [16, 48, 128]

    for size in sizes:
        # Create image with gradient background
        img = Image.new('RGB', (size, size), color='#1f2937')
        draw = ImageDraw.Draw(img)

        # Draw a simple musical note
        center_x, center_y = size // 2, size // 2
        note_size = size * 0.6

        # Draw note head (oval)
        head_width = note_size * 0.4
        head_height = note_size * 0.3
        draw.ellipse([
            center_x - head_width/2,
            center_y - head_height/2,
            center_x + head_width/2,
            center_y + head_height/2
        ], fill='#9333ea')

        # Draw note stem
        stem_width = note_size * 0.1
        stem_height = note_size * 0.5
        draw.rectangle([
            center_x + head_width/2 - stem_width/2,
            center_y - head_height/2,
            center_x + head_width/2 + stem_width/2,
            center_y - head_height/2 + stem_height
        ], fill='#9333ea')

        # Draw note flag (simplified)
        if size >= 48:
            flag_points = [
                (center_x + head_width/2, center_y - head_height/2),
                (center_x + head_width/2 + note_size * 0.2, center_y - head_height/2 - note_size * 0.1),
                (center_x + head_width/2 + note_size * 0.15, center_y - head_height/2 + note_size * 0.1),
            ]
            draw.polygon(flag_points, fill='#9333ea')

        img.save(f'icons/icon{size}.png')
        print(f'Created icon{size}.png')
    print('All icons created successfully!')
except ImportError:
    print("PIL/Pillow not installed. Creating placeholder icons...")
    # Create simple placeholder files
    import os
    os.makedirs('icons', exist_ok=True)
    for size in [16, 48, 128]:
        # Create a simple text file as placeholder
        with open(f'icons/icon{size}.png', 'w') as f:
            f.write('PNG placeholder - replace with actual icon')
        print(f'Created placeholder icon{size}.png')
    print('Please replace placeholder icons with actual PNG images')
