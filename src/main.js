import { parseFiles } from './modules/parser';
import { updateTables, updateSummaryBoxes } from './modules/ui';
import { initCharts, updateCharts } from './modules/charts';

// Initialize
initCharts();

// File Input Handler
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
        document.getElementById('modeIndicator').textContent = 'Dosyalar İşleniyor...';
        try {
            const data = await parseFiles(Array.from(e.target.files));
            updateDashboard(data);
            document.getElementById('modeIndicator').textContent = '✅ Veriler Güncellendi';
            document.getElementById('dateRangeInfo').textContent = `Güncellendi: ${new Date().toLocaleTimeString()}`;
        } catch (err) {
            console.error(err);
            document.getElementById('modeIndicator').textContent = '⚠️ Hata Oluştu';
            alert('Dosya işlenirken hata oluştu: ' + err.message);
        }
    }
});

function updateDashboard(data) {
    // Update global variables or state if needed

    // Update UI Components
    updateSummaryBoxes(data.metrics);
    updateCharts(data);
    updateTables(data);
}

// Tab Switching Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;

        // Remove active class
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Add active class
        e.target.classList.add('active');
        document.getElementById('tab-' + tabId).classList.add('active');
    });
});

// DEV: Auto-load if we were in a real env with access to FS, but browser can't auto-read files effectively without user action.
// However, since we are in a unique agent environment, I can simulate 'dropping' the files if I really wanted to by fetching them and passing them to parser.
// For now, we rely on user dragging files or selecting them.
console.log("Dashboard Loaded. Waiting for files.");
