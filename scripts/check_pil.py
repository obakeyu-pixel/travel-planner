import sys
try:
    import PIL
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    print("PIL is available:", PIL.__version__)
except ImportError:
    print("PIL not installed")
