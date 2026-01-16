import XLSX from 'xlsx';
import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

// Source Directory (User's Desktop Folder)
const SOURCE_DIR = 'C:\\Users\\NEKO\\Desktop\\Amazon Siparişler';
const OUT_DIR = './public/data';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper to find file by pattern
function findFile(pattern) {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.warn(`Source directory not found: ${SOURCE_DIR}`);
        return null;
    }
    const files = fs.readdirSync(SOURCE_DIR);
    // Filter by pattern
    const matched = files.filter(f => f.includes(pattern) && !f.includes('~$')); // Exclude temp files
    if (matched.length === 0) return null;

    // Sort by modification time (newest first)
    matched.sort((a, b) => {
        const statA = fs.statSync(path.join(SOURCE_DIR, a));
        const statB = fs.statSync(path.join(SOURCE_DIR, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
    });

    return path.join(SOURCE_DIR, matched[0]);
}

// 1. Convert FBA Orders (XLS)
try {
    const orderPath = findFile('FBA Orders');
    if (orderPath) {
        console.log(`Processing FBA Orders: ${orderPath}`);
        const workbook = XLSX.readFile(orderPath);
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        fs.writeFileSync(path.join(OUT_DIR, 'fba_orders.json'), JSON.stringify(rows));
        console.log(`Saved ${rows.length} FBA orders to fba_orders.json`);
    } else {
        console.error("FBA Orders file not found in designated folder.");
    }
} catch (e) {
    console.error("Error processing FBA orders:", e);
}

// 2. Convert FBA Invoices (CSV)
try {
    const invoicePath = findFile('FBA Invoices');
    if (invoicePath) {
        console.log(`Processing FBA Invoices: ${invoicePath}`);
        const csvContent = fs.readFileSync(invoicePath, 'utf8');

        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                fs.writeFileSync(path.join(OUT_DIR, 'fba_invoices.json'), JSON.stringify(results.data));
                console.log(`Saved ${results.data.length} FBA invoices to fba_invoices.json`);
            }
        });
    } else {
        console.error("FBA Invoices file not found in designated folder.");
    }

} catch (e) {
    console.error("Error processing FBA invoices:", e);
}

// 3. Convert DF Orders (CSV)
try {
    const dfOrderPath = findFile('DF Orders');
    if (dfOrderPath) {
        console.log(`Processing DF Orders: ${dfOrderPath}`);
        const csvContent = fs.readFileSync(dfOrderPath, 'utf8');

        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                fs.writeFileSync(path.join(OUT_DIR, 'df_orders.json'), JSON.stringify(results.data));
                console.log(`Saved ${results.data.length} DF orders to df_orders.json`);
            }
        });
    } else {
        console.log("DF Orders file not found (Optional).");
    }

} catch (e) {
    console.error("Error processing DF invoices:", e);
}
