// PDF.js Worker Setup
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ፒዲኤፍ ማንበቢያውን Screen በራስ-ሰር የሚፈጥር
(function initPdfViewerDOM() {
    if (document.getElementById('pdfView')) return;
    const viewerHTML = `
        <div id="pdfView" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0f172a; z-index: 10001; box-sizing: border-box; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.95); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; z-index: 10005; box-shadow: 0 2px 10px rgba(0,0,0,0.3); backdrop-filter: blur(6px);">
                <span id="pdfViewerTitle" style="color: white; font-size: 14px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">📖 PDF Reader</span>
                <button onclick="closePdfViewer()" style="background: #ef4444; color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">✖ ዝጋ (Close)</button>
            </div>
            <div id="pdfScrollArea" style="width: 100%; height: 100%; overflow-y: auto; overflow-x: auto; box-sizing: border-box; padding-top: 55px; padding-bottom: 40px; -webkit-overflow-scrolling: touch;">
                <div id="pdfPagesWrapper" style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 10px 4px; width: 100%; min-width: 100%; box-sizing: border-box; transition: width 0.1s ease-out;">
                    <div style="color: white; font-size: 14px; font-weight: bold; margin-top: 80px; text-align: center;">⏳ ፒዲኤፉ በመጫን ላይ ነው...</div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
})();

// Touch Zoom & Pan Controller
let currentZoom = 100;
let initialDist = 0;
let baseZoom = 100;

document.addEventListener('DOMContentLoaded', () => {
    const scrollArea = document.getElementById('pdfScrollArea');
    const pagesWrapper = document.getElementById('pdfPagesWrapper');

    if (scrollArea && pagesWrapper) {
        scrollArea.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                initialDist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                baseZoom = currentZoom;
            }
        }, { passive: true });

        scrollArea.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2 && initialDist > 0) {
                e.preventDefault();
                const dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                const factor = dist / initialDist;
                currentZoom = Math.min(Math.max(100, Math.round(baseZoom * factor)), 300);
                pagesWrapper.style.width = `${currentZoom}%`;
            }
        }, { passive: false });

        scrollArea.addEventListener('touchend', function(e) {
            if (e.touches.length < 2) initialDist = 0;
        });

        let lastTapTime = 0;
        scrollArea.addEventListener('touchend', function(e) {
            if (e.touches.length === 0) {
                const now = Date.now();
                if (now - lastTapTime < 300) {
                    e.preventDefault();
                    currentZoom = currentZoom > 120 ? 100 : 180;
                    pagesWrapper.style.width = `${currentZoom}%`;
                }
                lastTapTime = now;
            }
        });
    }
});

function openPdfViewer(pdfUrl, title) {
    const pdfView = document.getElementById('pdfView');
    const pagesWrapper = document.getElementById('pdfPagesWrapper');
    const scrollArea = document.getElementById('pdfScrollArea');
    
    document.getElementById('pdfViewerTitle').innerText = title || "📖 PDF Reader";
    pagesWrapper.innerHTML = '<div style="color: white; font-size: 14px; font-weight: bold; margin-top: 80px; text-align: center;">⏳ ፒዲኤፉ በመጫን ላይ ነው...</div>';
    pdfView.style.display = 'block';
    scrollArea.scrollTop = 0;
    currentZoom = 100;
    pagesWrapper.style.width = '100%';

    pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc) {
        pagesWrapper.innerHTML = '';
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const canvas = document.createElement('canvas');
            canvas.style.cssText = "display: block; width: 96% !important; max-width: 650px; height: auto !important; background: white; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border-radius: 4px;";
            pagesWrapper.appendChild(canvas);

            pdfDoc.getPage(pageNum).then(function(page) {
                const ctx = canvas.getContext('2d');
                const viewport = page.getViewport({ scale: 2.2 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                page.render({ canvasContext: ctx, viewport: viewport });
            });
        }
    }).catch(function(error) {
        alert("⚠️ PDF መጫን አልተቻለም፦ " + error.message);
        closePdfViewer();
    });
}

function closePdfViewer() {
    const pdfView = document.getElementById('pdfView');
    if (pdfView) pdfView.style.display = 'none';
    const pagesWrapper = document.getElementById('pdfPagesWrapper');
    if (pagesWrapper) pagesWrapper.innerHTML = '';
}
