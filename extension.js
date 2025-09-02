import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Soup from 'gi://Soup';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';

import { ImageProcessor } from './utils/imageProcessor.js';

export default class PaloWallpaperExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._timeout = null;
    }

    async fetchImageMetadata() {
        const API_URL = 'https://creative.jahidlimon.com/palo-wallpaper/fetch.php';

        try {
            const session = new Soup.Session();
            const message = Soup.Message.new('GET', API_URL);

            message.request_headers.append('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            message.request_headers.append('Accept', 'application/json;q=0.9,*/*;q=0.8');
            message.request_headers.append('Accept-Language', 'en-US,en;q=0.9');

            const response = await new Promise((resolve, reject) => {
                const loop = new GLib.MainLoop(null, false);

                session.send_and_read_async(message, null, null, (session, res) => {
                    try {
                        const data = session.send_and_read_finish(res);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    } finally {
                        loop.quit();
                    }
                });

                loop.run();
            });

            const responseText = new TextDecoder().decode(response.get_data());
            const data = JSON.parse(responseText);
            return data;
        } catch (e) {
            console.error('Failed to fetch image metadata:', e);
            return null;
        }
    }

    async downloadImage(url, outputPath) {
        try {
            const session = new Soup.Session();
            const message = Soup.Message.new('GET', url);

            message.request_headers.append(
                'User-Agent',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );
            message.request_headers.append('Accept', 'image/*,*/*;q=0.8');
            message.request_headers.append('Accept-Language', 'en-US,en;q=0.9');

            const response = await new Promise((resolve, reject) => {
                const loop = new GLib.MainLoop(null, false);

                session.send_and_read_async(message, null, null, (session, res) => {
                    try {
                        const data = session.send_and_read_finish(res);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    } finally {
                        loop.quit();
                    }
                });

                loop.run();
            });

            const file = Gio.File.new_for_path(outputPath);
            const outputStream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);

            const success = outputStream.write_all(response.get_data(), null);
            outputStream.close(null);

            return success[0];
        } catch (e) {
            console.error('Failed to download image:', e);
            return false;
        }
    }

    async fetchWallpapers() {
        const data = await this.fetchImageMetadata();
        let fileName, fullPath, fileUrl;

        if (!data) return;

        const imagePath = GLib.get_home_dir() + '/.local/share/palo-wallpapers/';
        GLib.mkdir_with_parents(imagePath, 0o755);

        for (const single of data) {
            fileName = `${single.uuid}.jpg`;
            fullPath = `${imagePath}${fileName}`;
            fileUrl = `${single.url}?w=1920&auto=format%2Ccompress&fmt=jpg`

            try {
                if (GLib.file_test(fullPath, GLib.FileTest.EXISTS)) continue;

                const downloadSuccess = await this.downloadImage(single.url, fullPath);
                if (!downloadSuccess) continue;

                await ImageProcessor.addOverlay(fullPath, single);
            } catch (e) {
                console.error('Failed to download:', e);
            }
        }
    }

    async setWallpaper() {
        const imagePath = GLib.get_home_dir() + '/.local/share/palo-wallpapers/';

        try {
            let files = [];
            let info;

            const dirEnum = Gio.File.new_for_path(imagePath).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NONE, null);

            while ((info = dirEnum.next_file(null)) !== null) {
                if (info.get_name().endsWith('_overlay.jpg')) {
                    files.push(info.get_name());
                }
            }
            dirEnum.close(null);

            if (files.length === 0) return;
            const randomIndex = Math.floor(Math.random() * files.length);
            const finalPath = `${imagePath}${files[randomIndex]}`;

            const settings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
            settings.set_string('picture-options', 'scaled');
            settings.set_string('picture-uri', `file://${finalPath}`);
            settings.set_string('picture-uri-dark', `file://${finalPath}`);
        } catch (e) {
            console.error('Failed to set wallpaper:', e);
        }
    }

    enable() {
        this.fetchWallpapers();
        this.setWallpaper();

        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 300, () => {
            this.setWallpaper();
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
    }
}