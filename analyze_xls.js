import XLSX from 'xlsx';
import { readFileSync } from 'fs';

console.log('=== FBA XLS FULL HEADERS ===\n');

try {
    const buf = readFileSync('C:\\Users\\NEKO\\Documents\\AmazonReports\\Amazon FBA Orders_2026-01-12.xls');
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const headers = data[0] || [];
    console.log('--- HEADERS START ---');
    headers.forEach((h, i) => {
        console.log(`${i}: ${h}`);
    });
    console.log('--- HEADERS END ---');
} catch (e) {
    console.error('Error:', e.message);
}
