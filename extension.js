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
            session.user_agent = `User-Agent: Mozilla/5.0 (X11; GNOME Shell/${Config.PACKAGE_VERSION}; Linux x86_64; +https://github.com/mjk-limon/palo-wallpaper-manager-gnome-extension ) PaloWallpaper-Gnome-Extension/1.0`;
            const message = Soup.Message.new('GET', API_URL);
            
            const response = await new Promise((resolve, reject) => {
                session.send_and_read_async(message, null, null, (session, res) => {
                    try {
                        const data = session.send_and_read_finish(res);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                });
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
            session.user_agent = `User-Agent: Mozilla/5.0 (X11; GNOME Shell/${Config.PACKAGE_VERSION}; Linux x86_64; +https://github.com/mjk-limon/palo-wallpaper-manager-gnome-extension ) PaloWallpaper-Gnome-Extension/1.0`;
            const message = Soup.Message.new('GET', url);
            
            const response = await new Promise((resolve, reject) => {
                session.send_and_read_async(message, null, null, (session, res) => {
                    try {
                        const data = session.send_and_read_finish(res);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                });
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
        // const data = await this.fetchImageMetadata();
        let fileName, fullPath, fileUrl;

        // if (!data) return;

        const data = [{
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

        const imagePath = GLib.get_home_dir() + '/.local/share/palo-wallpapers/';
        GLib.mkdir_with_parents(imagePath, 0o755);

        for (const single of data) {
            fileName = `${single.uuid}.jpg`;
            fullPath = `${imagePath}${fileName}`;
            fileUrl = `${single.url}?w=1920&auto=format%2Ccompress&fmt=jpg`

            try {
                // if (GLib.file_test(fullPath, GLib.FileTest.EXISTS)) continue;

                // const downloadSuccess = await this.downloadImage(single.url, fullPath);
                // if (!downloadSuccess) continue;

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

        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
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