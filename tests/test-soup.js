#!/usr/bin/env gjs

import Gio from 'gi://Gio';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

// ---- Functions you want to test ----
function fetchImageMetadata(url) {
  return new Promise((resolve, reject) => {
    let session = new Soup.Session();
    let msg = Soup.Message.new('GET', url);

    msg.request_headers.append(
      'User-Agent',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    msg.request_headers.append('Accept', 'application/json;q=0.9,*/*;q=0.8');
    msg.request_headers.append('Accept-Language', 'en-US,en;q=0.9');

    const loop = new GLib.MainLoop(null, false);

    session.send_and_read_async(msg, null, null, (sess, res) => {
      try {
        print("hi, callback fired ✅");

        let response = session.send_and_read_finish(res);
        print(new TextDecoder().decode(response.get_data()));
        resolve(text);
      } catch (e) {
        reject(e);
      } finally {
        loop.quit();
      }
    });

    loop.run();
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    let session = new Soup.Session();
    let msg = Soup.Message.new('GET', url);

    msg.request_headers.append(
      'User-Agent',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    msg.request_headers.append('Accept', 'image/*,*/*;q=0.8');
    msg.request_headers.append('Accept-Language', 'en-US,en;q=0.9');

    session.send_async(msg, null, (sess, res) => {
      try {
        let stream = session.send_finish(res);
        let input = stream.read_bytes(10_000_000, null);

        let file = Gio.File.new_for_path(destPath);
        let outStream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        outStream.write_bytes(input, null);
        outStream.close(null);

        resolve(destPath);
      } catch (e) {
        reject(e);
      }
    });
  });
}

// ---- Main test run ----
(async () => {
  try {
    print("Fetching metadata...");
    let meta = fetchImageMetadata("https://creative.jahidlimon.com/palo-wallpaper/fetch.php");

    // print("Hi");
    // print(meta);
    // print("Metadata:\n" + responseText);

    // print("\nDownloading image...");
    // let saved = await downloadImage(
    //     "https://via.placeholder.com/400",
    //     "./test_image.jpg"
    // );
    // print("Saved image at: " + saved);
  } catch (err) {
    printerr("Error: " + err.message);
  }
})();
