#!/usr/bin/env gjs

const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Pango = imports.gi.Pango;
const PangoCairo = imports.gi.PangoCairo;
const Cairo = imports.gi.cairo;

// Include your ImageProcessor class here directly
class ImageProcessor {
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
    for (let i = 0; i < 20; i++) {
      let dx = (Math.random() - 0.5) * 20;
      let dy = (Math.random() - 0.5) * 20;
      cr.save();
      cr.translate(bgX + dx, bgY + dy);
      cr.scale(bgScale, bgScale);
      Gdk.cairo_set_source_pixbuf(cr, pixbuf, 0, 0);
      cr.paintWithAlpha(0.05);
      cr.restore();
    }

    // Calculate scale to fit original image in center while maintaining aspect ratio
    const imageScale = Math.min(viewportWidth / originalWidth, viewportHeight / originalHeight);
    const imageWidth = originalWidth * imageScale;
    const imageHeight = originalHeight * imageScale;
    const imageX = (viewportWidth - imageWidth) / 2;
    const imageY = (viewportHeight - imageHeight) / 2;

    // Draw the original image centered
    cr.save();
    cr.translate(imageX, imageY);
    cr.scale(imageScale, imageScale);
    Gdk.cairo_set_source_pixbuf(cr, pixbuf, 0, 0);
    cr.paint();
    cr.restore();

    // Setup text layout for metadata overlay
    const layout = PangoCairo.create_layout(cr);
    const markup = `<span font="ShurjoWeb 16">${meta.title}</span>
<span font="ShurjoWeb 14">${meta.location}</span>
<span font="ShurjoWeb 14">${meta.captured_at}</span>
<span font="ShurjoWeb 12"><i>| ছবিঃ ${meta.captured_by}</i></span>`;

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

    print(`Overlay created: ${outputPath}`);
  }
}
const meta = [{
  "uuid": "palo_wp_1",
  "url": "https://media.prothomalo.com/prothomalo-bangla%2F2025-06-29%2F0iv8lfuf%2F%E0%A7%A7%E0%A7%A7.JPG",
  "title": "গবাদিপশুর জন্য খাদ্য সংগ্রহ করে বাড়ি ফিরছেন এক ব্যক্তি",
  "captured_by": "মঈনুল ইসলাম",
  "captured_at": "২৯ জুন, ২০২৫",
  "location": "কাউনিয়া, রংপুর",
  "more_info_link": "https://www.prothomalo.com/photo/glimpse/jvu97taj4k"
}, {
  "uuid": "palo_wp_2",
  "url": "https://media.prothomalo.com/prothomalo-bangla%2F2025-06-29%2Ffbaeknuu%2Fp2zqmzer.jpg",
  "title": "খেত থেকে পাট কেটে এনে বাড়ির পাশে ডোবায় জাগ দিচ্ছেন এক কৃষক",
  "captured_by": "আলীমুজ্জামান",
  "captured_at": "২৮ জুন, ২০২৫",
  "location": "দয়ারামপুর, ফরিদপুর",
  "more_info_link": "https://www.prothomalo.com/photo/glimpse/jvu97taj4k"
}, {
  "uuid": "palo_wp_3",
  "url": "https://media.prothomalo.com/prothomalo-bangla%2F2025-06-29%2Fx5s10jys%2F4d66w994.JPG",
  "title": "মাঠে গরুগুলোকে ঘাস খাওয়াতে নিয়ে যাচ্ছেন এক নারী",
  "captured_by": "সাদ্দাম হোসেন",
  "captured_at": "২৯ জুন, ২০২৫",
  "location": "তেঁতুলতলা, বটিয়াঘাটা, খুলনা",
  "more_info_link": "https://www.prothomalo.com/photo/glimpse/jvu97taj4k"
}, {
  "uuid": "palo_wp_4",
  "url": "https://media.prothomalo.com/prothomalo-bangla%2F2025-06-29%2F1hz88hgl%2F%E0%A7%A7%E0%A7%A9.jpg",
  "title": "পড়ন্ত বিকেলে হঠাৎ বৃষ্টি। এর মধ্যে নৌকায় করে বিল পাড়ি দিয়ে বাড়ি ফিরছেন এক ব্যক্তি",
  "captured_by": "কল্যাণ প্রসূন",
  "captured_at": "২৮ জুন, ২০২৫",
  "location": "গৌরাঙ বিল, জুড়ী, মৌলভীবাজার",
  "more_info_link": "https://www.prothomalo.com/photo/glimpse/jvu97taj4k"
}, {
  "uuid": "palo_wp_5",
  "url": "https://media.prothomalo.com/prothomalo-bangla%2F2025-06-29%2Ftocc9qp3%2F%E0%A7%A7%E0%A7%AA.JPG",
  "title": "হাওরের পানিতে মাছ শিকারে ব্যস্ত কয়েকজন",
  "captured_by": "তাফসিলুল আজিজ",
  "captured_at": "২৯ জুন, ২০২৫",
  "location": "নিকলী, কিশোরগঞ্জ",
  "more_info_link": "https://www.prothomalo.com/photo/glimpse/jvu97taj4k"
}, {
  "uuid": "palo_wp_19",
  "url": "https://media.prothomalo.com/prothomalo-bangla%2F2025-06-30%2F8pl4pyhi%2F%E0%A7%A7%E0%A7%AE.jpg",
  "title": "আকাশে সাদা মেঘের ভেলা। নিচে হাওরের জলে নৌকায় ভেসে মাছ শিকার করছেন এক ব্যক্তি",
  "captured_by": "আনিস মাহমুদ",
  "captured_at": "৩০ জুন, ২০২৫",
  "location": "মেদি বিল, দক্ষিণ সুরমা, সিলেট",
  "more_info_link": "https://www.prothomalo.com/photo/glimpse/vmyossaxbw"
}];

try {
  for (const image of meta) {
    ImageProcessor.addOverlay(`/home/jahid/.local/share/palo-wallpapers/${image.uuid}.jpg`, image);
  }
} catch (e) {
  print(e);
}