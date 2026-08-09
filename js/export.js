(function() {
"use strict";

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__ExportLoaded) return;
window.__ExportLoaded = true;

const Utils = window.KESEMPATAN?.Utils || window.Utils || {};
const escapeHtml = Utils.escapeHtml || window.escapeHtml || function(str) { return String(str); };
const showToast = Utils.showToast || window.showToast || function() {};
const Logger = Utils.Logger || { system: function() {}, info: function() {}, warn: function() {}, error: function() {}, success: function() {} };

let lastAggregated = null;
let lastVerifierNote = "";

function setExportData(aggregated, verifierNote) {
    lastAggregated = aggregated;
    lastVerifierNote = verifierNote || "";
}

function exportToJSON() {
    if (!lastAggregated) {
        showToast("Tidak ada hasil", "error");
        return;
    }
    const data = {
        timestamp: new Date().toISOString(),
        topic: document.getElementById("topicInput")?.value || "",
        aggregated: lastAggregated,
        verifier_note: lastVerifierNote
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kes_report_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("JSON berhasil diunduh", "success");
}

function exportToHTML() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan", "error");
        return;
    }
    const content = document.getElementById("reportContainer")?.innerHTML || "";
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kes_report_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("HTML berhasil diunduh", "success");
}

async function exportToPDF() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan", "error");
        return;
    }
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
        showToast("Library PDF belum siap", "error");
        return;
    }
    const element = document.getElementById("reportContainer");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#030611" });
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`kes_report_${Date.now()}.pdf`);
    showToast("PDF berhasil diunduh", "success");
}

function exportToCSV() {
    if (!lastAggregated) {
        showToast("Tidak ada hasil untuk diekspor", "error");
        return;
    }
    const metrics = lastAggregated.metrics;
    const rows = ["Metric,Value"];
    for (const [key, value] of Object.entries(metrics)) {
        rows.push(`${key},${value}`);
    }
    rows.push(`Final Score,${lastAggregated.score}`);
    rows.push(`Timestamp,${new Date().toISOString()}`);
    rows.push(`Topic,${document.getElementById("topicInput")?.value || ""}`);
    const csvString = rows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kes_metrics_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("CSV berhasil diunduh", "success");
}

async function exportToExcel() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan untuk diekspor", "error");
        return;
    }
    try {
        if (typeof XLSX === 'undefined') {
            showToast("Memuat library Excel...", "info");
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Gagal load library Excel'));
                document.head.appendChild(script);
            });
        }
        const metrics = lastAggregated.metrics;
        const data = [
            ["Metric", "Value", "Description"],
            ["Demand", metrics.demand, "Tuntutan Pasar"],
            ["Competition", metrics.competition, "Kepadatan Pasar"],
            ["Monetization", metrics.monetization, "Daya Ungkit Keuntungan"],
            ["Virality", metrics.virality, "Potensi Menyebar"],
            ["Sustainability", metrics.sustainability, "Keberlanjutan Tren"],
            ["Scalability", metrics.scalability, "Batas Skalabilitas"],
            ["Timing", metrics.timing, "Ketepatan Waktu"],
            ["Attention", metrics.attention, "Retensi Perhatian"],
            ["Execution", metrics.execution, "Kemudahan Operasional"],
            ["LongTerm", metrics.longterm, "Nilai Jangka Panjang"],
            ["", "", ""],
            ["Final Score", lastAggregated.score, "Skor Akhir"],
            ["", "", ""],
            ["Insights", lastAggregated.insight?.join(", ") || "", "Insight Utama"],
            ["Strategies", lastAggregated.strategy?.join(", ") || "", "Strategi yang Direkomendasikan"],
            ["Risks", lastAggregated.risk?.join(", ") || "", "Risiko yang Teridentifikasi"],
            ["Recommendation", lastAggregated.recommendation || "", "Rekomendasi Final"],
            ["", "", ""],
            ["Generated by", "KESEMPATAN OS", "Autonomous Opportunity Intelligence"],
            ["Timestamp", new Date().toLocaleString(), ""]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "KES_Report");
        worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 40 }];
        XLSX.writeFile(workbook, `kes_report_${Date.now()}.xlsx`);
        showToast("Excel berhasil diunduh", "success");
    } catch (error) {
        showToast("Gagal export Excel: " + error.message, "error");
    }
}

async function exportToPPTX() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan untuk diekspor", "error");
        return;
    }
    try {
        if (typeof PptxGenJS === 'undefined') {
            showToast("Memuat library PowerPoint...", "info");
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Gagal load library PowerPoint'));
                document.head.appendChild(script);
            });
        }
        const pptx = new PptxGenJS();
        pptx.defineLayout({ name: "WIDE", width: 10, height: 5.625 });
        pptx.layout = "WIDE";
        const topic = document.getElementById("topicInput")?.value || "Opportunity Intelligence";

        let slide = pptx.addSlide();
        slide.addText("KESEMPATAN OS", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 36, bold: true, color: "00FFA3", align: "center" });
        slide.addText("Laporan Intelijen Otonom", { x: 0.5, y: 1.2, w: 9, h: 0.8, fontSize: 20, color: "FFFFFF", align: "center" });
        slide.addText(`Analisis: ${topic.substring(0, 60)}`, { x: 0.5, y: 2.2, w: 9, h: 0.8, fontSize: 16, color: "CCCCCC", align: "center" });
        slide.addText(new Date().toLocaleString(), { x: 0.5, y: 4.5, w: 9, h: 0.5, fontSize: 12, color: "888888", align: "center" });

        slide = pptx.addSlide();
        slide.addText("Skor Akhir", { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 24, bold: true, color: "00FFA3" });
        slide.addText(`${lastAggregated.score}/100`, { x: 0.5, y: 1.2, w: 9, h: 1.5, fontSize: 48, bold: true, color: "00FFA3", align: "center" });

        slide = pptx.addSlide();
        slide.addText("10 Engine Penilaian", { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 20, bold: true, color: "00FFA3" });
        const metrics = lastAggregated.metrics;
        const metricRows = [
            ["Demand", metrics.demand], ["Competition", metrics.competition], ["Monetization", metrics.monetization],
            ["Virality", metrics.virality], ["Sustainability", metrics.sustainability], ["Scalability", metrics.scalability],
            ["Timing", metrics.timing], ["Attention", metrics.attention], ["Execution", metrics.execution], ["Long-Term", metrics.longterm]
        ];
        let yPos = 1.0;
        for (let i = 0; i < metricRows.length; i++) {
            slide.addText(`${metricRows[i][0]}: ${metricRows[i][1]} / 100`, { x: 0.5, y: yPos, w: 4.5, h: 0.4, fontSize: 12, color: "FFFFFF" });
            const barWidth = (metricRows[i][1] / 100) * 4;
            if (barWidth > 0) {
                slide.addShape(pptx.ShapeType.RECTANGLE, { x: 5, y: yPos, w: barWidth, h: 0.3, fill: { color: "00FFA3" }, line: { color: "00FFA3" } });
            }
            yPos += 0.45;
        }

        await pptx.writeFile({ fileName: `kes_report_${Date.now()}.pptx` });
        showToast("PowerPoint berhasil diunduh", "success");
    } catch (error) {
        showToast("Gagal export PowerPoint: " + error.message, "error");
    }
}

function exportToGoogleDocs() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan untuk diekspor", "error");
        return;
    }
    const content = document.getElementById("reportContainer")?.innerHTML || "";
    const instructions = `Untuk ekspor ke Google Docs:\n1. Buka docs.google.com\n2. Buat dokumen baru\n3. Copy-paste HTML berikut:\n\n${content}`;
    const blob = new Blob([instructions], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kes_google_docs_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Petunjuk ekspor Google Docs diunduh.", "success");
}

async function exportToGoogleSheets() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan untuk diekspor", "error");
        return;
    }
    try {
        showToast("Menyiapkan data untuk Google Sheets...", "info");
        const topic = document.getElementById("topicInput")?.value || "Opportunity Report";
        const metrics = lastAggregated.metrics;
        const rows = [
            ["Metric", "Value", "Description"],
            ["Demand", metrics.demand, "Tuntutan Pasar"],
            ["Competition", metrics.competition, "Kepadatan Pasar"],
            ["Monetization", metrics.monetization, "Daya Ungkit Keuntungan"],
            ["Virality", metrics.virality, "Potensi Menyebar"],
            ["Sustainability", metrics.sustainability, "Keberlanjutan Tren"],
            ["Scalability", metrics.scalability, "Batas Skalabilitas"],
            ["Timing", metrics.timing, "Ketepatan Waktu"],
            ["Attention", metrics.attention, "Retensi Perhatian"],
            ["Execution", metrics.execution, "Kemudahan Operasional"],
            ["LongTerm", metrics.longterm, "Nilai Jangka Panjang"],
            ["", "", ""],
            ["Final Score", lastAggregated.score, "Skor Akhir"],
            ["", "", ""],
            ["Insights", lastAggregated.insight?.join(", ") || "", "Insight Utama"],
            ["Strategies", lastAggregated.strategy?.join(", ") || "", "Strategi"],
            ["Risks", lastAggregated.risk?.join(", ") || "", "Risiko"],
            ["Recommendation", lastAggregated.recommendation || "", "Rekomendasi"],
            ["", "", ""],
            ["Generated by", "KESEMPATAN OS", "Autonomous Intelligence"],
            ["Timestamp", new Date().toLocaleString(), ""],
            ["", "", ""],
            ["Topic", topic, "Topik Analisis"]
        ];
        const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `kes_sheets_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast("CSV siap! Upload ke Google Sheets untuk membuka", "success");
        showToast("Buka sheets.new -> File -> Import -> Upload", "info");
    } catch (error) {
        showToast("Gagal export Google Sheets: " + error.message, "error");
    }
}

async function exportToNotion() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan untuk diekspor", "error");
        return;
    }
    const notionApiKey = prompt("Masukkan Notion Integration Token:");
    if (!notionApiKey) return;
    const pageId = prompt("Masukkan Notion Page ID:");
    if (!pageId) return;
    const content = document.getElementById("reportContainer")?.innerText || "";
    const title = document.getElementById("topicInput")?.value || "KESEMPATAN OS Report";
    try {
        const response = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${notionApiKey}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify({
                parent: { page_id: pageId },
                properties: {
                    title: { title: [{ text: { content: title.substring(0, 200) } }] }
                },
                children: [{
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{ type: "text", text: { content: content.substring(0, 2000) } }]
                    }
                }]
            })
        });
        if (response.ok) showToast("Laporan berhasil dikirim ke Notion", "success");
        else throw new Error(await response.text());
    } catch (error) {
        showToast("Gagal ekspor ke Notion: " + error.message, "error");
    }
}

function exportToEmail() {
    if (!lastAggregated) {
        showToast("Tidak ada laporan. Jalankan START ENGINE dulu.", "error");
        return;
    }
    const email = prompt("Masukkan email tujuan:", "");
    if (!email) return;
    const topic = document.getElementById("topicInput")?.value || "Opportunity";
    const report = lastAggregated;
    const subject = `📊 Laporan KESEMPATAN OS: ${topic}`;
    const body = `Topik: ${topic}\nSkor: ${report.score}/100\n\nRingkasan:\n${report.summary || '-'}\n\nInsight:\n${(report.insight || []).join('\n')}\n\nRekomendasi:\n${report.recommendation || '-'}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    showToast("📧 Email client terbuka, silakan kirim manual.", "success");
}

function renderExportSection() {
    const container = document.getElementById("exportSectionContainer");
    if (!container) return;
    container.innerHTML =
        '<div class="export-label-group" id="exportToggleLabel" role="button" tabindex="0" aria-expanded="false">EXPORT LAPORAN <span class="section-toggle-arrow" id="exportToggleArrow">▾</span></div>' +
        '<div class="export-icons-wrapper" id="exportIconsWrapper" style="display:none;">' +
            '<div class="export-grid">' +
                '<div class="export-icon-wrapper" id="exportJsonWrapper"><div class="export-icon json" id="exportJsonIcon">{ }</div><span class="export-label">JSON</span></div>' +
                '<div class="export-icon-wrapper" id="exportHtmlWrapper"><div class="export-icon html" id="exportHtmlIcon">&lt;/&gt;</div><span class="export-label">HTML</span></div>' +
                '<div class="export-icon-wrapper" id="exportPdfWrapper"><div class="export-icon pdf" id="exportPdfIcon">PDF</div><span class="export-label">PDF</span></div>' +
                '<div class="export-icon-wrapper" id="exportCsvWrapper"><div class="export-icon csv" id="exportCsvIcon">CSV</div><span class="export-label">CSV</span></div>' +
                '<div class="export-icon-wrapper" id="exportExcelWrapper"><div class="export-icon excel" id="exportExcelIcon">XLS</div><span class="export-label">Excel</span></div>' +
                '<div class="export-icon-wrapper" id="exportPptxWrapper"><div class="export-icon pptx" id="exportPptxIcon">PPT</div><span class="export-label">PPTX</span></div>' +
                '<div class="export-icon-wrapper" id="exportDocsWrapper"><div class="export-icon docs" id="exportGoogleDocsIcon">DOC</div><span class="export-label">Google Docs</span></div>' +
                '<div class="export-icon-wrapper" id="exportSheetsWrapper"><div class="export-icon sheets" id="exportSheetsIcon">SHT</div><span class="export-label">Google Sheets</span></div>' +
                '<div class="export-icon-wrapper" id="exportNotionWrapper"><div class="export-icon notion" id="exportNotionIcon">N</div><span class="export-label">Notion</span></div>' +
                '<div class="export-icon-wrapper" id="emailExportWrapper"><div class="export-icon email" id="emailReportIcon">@</div><span class="export-label">Email</span></div>' +
            '</div>' +
        '</div>';
    attachExportEvents();

    const toggleLabel = document.getElementById('exportToggleLabel');
    const iconsWrapper = document.getElementById('exportIconsWrapper');
    const toggleArrow = document.getElementById('exportToggleArrow');

    function setExportOpen(open) {
        iconsWrapper.style.display = open ? 'block' : 'none';
        toggleArrow.textContent = open ? '▴' : '▾';
        toggleLabel.setAttribute('aria-expanded', open ? 'true' : 'false');
        localStorage.setItem('kes_export_open', open ? '1' : '0');
    }

    if (toggleLabel) {
        toggleLabel.addEventListener('click', function() {
            setExportOpen(iconsWrapper.style.display === 'none');
        });
        toggleLabel.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExportOpen(iconsWrapper.style.display === 'none');
            }
        });
    }
    setExportOpen(localStorage.getItem('kes_export_open') === '1');
}

function attachExportEvents() {
    const exportMap = {
        Json: "toJSON", Html: "toHTML", Pdf: "toPDF", Csv: "toCSV",
        Excel: "toExcel", Pptx: "toPPTX", Docs: "toGoogleDocs",
        Sheets: "toGoogleSheets", Notion: "toNotion"
    };
    Object.keys(exportMap).forEach(function(name) {
        const method = exportMap[name];
        const wrapper = document.getElementById("export" + name + "Wrapper");
        if (wrapper) {
            wrapper.addEventListener("click", function(e) {
                e.stopPropagation();
                window.ExportManager[method]();
            });
        }
    });
    const emailWrapper = document.getElementById("emailExportWrapper");
    if (emailWrapper) {
        emailWrapper.addEventListener("click", function(e) {
            e.stopPropagation();
            window.ExportManager.toEmail();
        });
    }
}

function initExportUI() {
    renderExportSection();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExportUI);
} else {
    initExportUI();
}

const ExportManager = Object.freeze({
    setData: setExportData,
    toJSON: exportToJSON,
    toHTML: exportToHTML,
    toPDF: exportToPDF,
    toCSV: exportToCSV,
    toExcel: exportToExcel,
    toPPTX: exportToPPTX,
    toGoogleDocs: exportToGoogleDocs,
    toGoogleSheets: exportToGoogleSheets,
    toNotion: exportToNotion,
    toEmail: exportToEmail,
    renderExportSection: renderExportSection
});

KESEMPATAN.ExportManager = ExportManager;
// Kept as a real global (not KESEMPATAN-only): social-share.js reassigns
// window.ExportManager wholesale (Object.assign with a wrapped setData) to
// hook into export completion, and this file's own click handlers read
// window.ExportManager fresh at click-time so they pick up that wrapper.
window.ExportManager = ExportManager;
})();