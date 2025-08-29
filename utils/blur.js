#!/usr/bin/env gjs

const Cairo = imports.gi.cairo;
const GdkPixbuf = imports.gi.GdkPixbuf;

const width = 1920;
const height = 1080;

// Create ARGB surface
let surface = new Cairo.ImageSurface(Cairo.Format.ARGB32, width, height);
let cr = new Cairo.Context(surface);

// Transparent background
cr.setSourceRGBA(0, 0, 0, 0);
cr.paint();

// Gradient: black (semi-transparent) at top → fully transparent at bottom
let gradient = new Cairo.LinearGradient(0, 0, 0, height);
gradient.addColorStopRGBA(0.0, 0, 0, 0, 0.6);  // top, 60% opacity black
gradient.addColorStopRGBA(0.3, 0, 0, 0, 0.3);  // fade middle
gradient.addColorStopRGBA(0.6, 0, 0, 0, 0.1);  // near transparent
gradient.addColorStopRGBA(1.0, 0, 0, 0, 0.0);  // bottom fully transparent

cr.setSource(gradient);
cr.rectangle(0, 0, width, height);
cr.fill();

// Export to PNG
surface.writeToPNG("blur-mask.png");

print("Generated blur-mask.png (1920x1080)");
