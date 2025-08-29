import Gdk from 'gi://Gdk';
import GdkPixbuf from 'gi://GdkPixbuf';
import Pango from 'gi://Pango';
import PangoCairo from 'gi://PangoCairo';
import Cairo from 'gi://cairo';

export class ImageProcessor {
    static addOverlay(imagePath, meta) {
        const outputPath = imagePath.replace(/\.jpg$/, '_overlay.jpg');

        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(imagePath);
        const originalWidth = pixbuf.get_width();
        const originalHeight = pixbuf.get_height();

        // Create 1920x1080 viewport
        const viewportWidth = 1920;
        const viewportHeight = 1080;
        const surface = new Cairo.ImageSurface(Cairo.Format.ARGB32, viewportWidth, viewportHeight);
        const cr = new Cairo.Context(surface);

        // Create blurred background
        // Scale the original image to fill the viewport while maintaining aspect ratio
        const bgScale = Math.max(viewportWidth / originalWidth, viewportHeight / originalHeight);
        const bgWidth = originalWidth * bgScale;
        const bgHeight = originalHeight * bgScale;
        const bgX = (viewportWidth - bgWidth) / 2;
        const bgY = (viewportHeight - bgHeight) / 2;

        // Draw blurred background
        cr.save();
        cr.translate(bgX, bgY);
        cr.scale(bgScale, bgScale);
        Gdk.cairo_set_source_pixbuf(cr, pixbuf, 0, 0);
        cr.paint();
        cr.restore();

        // Setup text layout for metadata overlay
        const layout = PangoCairo.create_layout(cr);
        const markup = `<span font="ShurjoWeb 16">${meta.title}</span>
<span font="ShurjoWeb 14">${meta.location}</span>
<span font="ShurjoWeb 14">${meta.captured_at}</span>
<span font="ShurjoWeb 12" color="#fcfcfc"><i>| ছবিঃ ${meta.captured_by}, প্রথম আলো</i></span>`;

        // Set text width to 50% of the original image width (not viewport)
        const maxTextWidthPx = Math.floor(originalWidth * 0.5);
        const maxTextWidthPango = maxTextWidthPx * Pango.SCALE;

        layout.set_width(maxTextWidthPango);
        layout.set_wrap(Pango.WrapMode.WORD_CHAR);
        layout.set_ellipsize(Pango.EllipsizeMode.NONE);
        layout.set_markup(markup, -1);

        // Get text size
        let [textWidth, textHeight] = layout.get_pixel_size();

        // Padding
        const padX = 20, padY = 10;

        // Calculate position for metadata overlay at bottom-left of the original image
        const overlayX = 0;
        const overlayY = viewportHeight - textHeight - padY * 2;

        // Draw semi-transparent background box at bottom-left of image
        cr.setSourceRGBA(0, 0, 0, 0.9);
        cr.rectangle(overlayX, overlayY, textWidth + padX * 2, textHeight + padY * 2);
        cr.fill();

        // Draw white text
        cr.setSourceRGB(1, 1, 1);
        cr.moveTo(overlayX + padX, overlayY + padY);
        PangoCairo.show_layout(cr, layout);

        // Write to JPEG
        const finalPixbuf = Gdk.pixbuf_get_from_surface(surface, 0, 0, viewportWidth, viewportHeight);
        finalPixbuf.savev(outputPath, 'jpeg', ['quality'], ['90']);

        return outputPath;
    }
}