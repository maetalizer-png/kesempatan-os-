/* ============================================================
KESEMPATAN OS - AI EDITOR WORKER
Menjalankan konvolusi sharpen 3x3 dari enhance2x() (ai-editor-ultimate.js)
di luar main thread. Loop-nya sama persis dengan versi sinkron sebelumnya
— hanya lokasi eksekusinya yang berubah, bukan hasilnya.
============================================================ */
'use strict';

self.onmessage = function (e) {
    const width = e.data.width;
    const height = e.data.height;
    const src = new Uint8ClampedArray(e.data.buffer);
    const out = new Uint8ClampedArray(src.length);

    // Start as a copy so alpha and border pixels (never touched by the loop
    // below, same as the original code) keep their original values.
    out.set(src);

    const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            for (let ch = 0; ch < 3; ch++) {
                let acc = 0, ki = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        acc += src[i + (dy * width + dx) * 4 + ch] * k[ki++];
                    }
                }
                out[i + ch] = acc;
            }
        }
    }

    self.postMessage({ buffer: out.buffer }, [out.buffer]);
};
