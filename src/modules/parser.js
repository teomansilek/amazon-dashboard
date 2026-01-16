import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseFiles(files) {
    const data = {
        dfOrders: [],
        fbaOrders: [],
        fbaInvoices: []
    };

    for (const file of files) {
        const fileName = file.name.toLowerCase();
        console.log('Processing file:', file.name);

        if (fileName.includes('df orders') || fileName.includes('df_orders')) {
            const parsed = await parseCSV(file);
            console.log('DF Orders parsed rows:', parsed.length);
            data.dfOrders = parsed;
        } else if (fileName.includes('fba orders') || fileName.includes('fba_orders')) {
            if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
                const parsed = await parseCSV(file);
                console.log('FBA Orders (CSV) parsed rows:', parsed.length);
                data.fbaOrders = parsed;
            } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                const parsed = await parseXLS(file);
                console.log('FBA Orders (XLS) parsed rows:', parsed.length);
                data.fbaOrders = parsed;
            }
        } else if (fileName.includes('invoices') || fileName.includes('fatura')) {
            const parsed = await parseCSV(file);
            console.log('Invoices parsed rows:', parsed.length);
            data.fbaInvoices = parsed;
        }
    }

    return processData(data);
}

function parseCSV(file) {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log('CSV Headers:', results.meta.fields);
                resolve(results.data);
            },
            error: (err) => {
                console.error("CSV Parse Error:", err);
                resolve([]);
            }
        });
    });
}

function parseXLS(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(firstSheet);
                console.log('XLS Headers:', Object.keys(json[0] || {}));
                resolve(json);
            } catch (err) {
                console.error('XLS Parse Error:', err);
                resolve([]);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function processData(rawData) {
    // 1. Normalize DF Orders - Using EXACT Turkish column names from CSV
    const dfItems = rawData.dfOrders.map(row => {
        const quantity = parseInt(row['Ürün Miktarı'] || row['Miktar'] || '0') || 0;
        const cost = parseMoney(row['Ürün Maliyeti'] || row['Unit Cost'] || '0');

        return {
            type: 'DF',
            orderId: row['Sipariş Numarası'] || '',
            asin: row['ASIN'] || '',
            sku: row['SKU'] || '',
            productName: row['Ürün Başlığı'] || row['Ürün Adı'] || '',
            quantity: quantity,
            unitCost: cost,
            totalCost: cost * quantity,
            status: row['Sipariş Durumu'] || '',
            date: row['Sipariş Yeri/Tarihi'] || ''
        };
    }).filter(i => i.asin && i.asin.length > 0);

    console.log('Valid DF items after filter:', dfItems.length);
    if (dfItems.length > 0) {
        console.log('Sample DF item:', dfItems[0]);
    }

    // 2. Normalize FBA Orders - Using common FBA report column names
    const fbaItems = rawData.fbaOrders.map(row => {
        // FBA reports can have various column names
        const quantity = parseInt(
            row['Quantity'] ||
            row['quantity-shipped'] ||
            row['Miktar'] ||
            row['quantity'] ||
            '0'
        ) || 0;

        const cost = parseMoney(
            row['Item Price'] ||
            row['item-price'] ||
            row['Birim Fiyat'] ||
            row['price'] ||
            '0'
        );

        return {
            type: 'FBA',
            orderId: row['Amazon Order Id'] || row['order-id'] || row['Sipariş No'] || '',
            asin: row['ASIN'] || row['asin'] || '',
            sku: row['SKU'] || row['sku'] || '',
            productName: row['Product Name'] || row['product-name'] || row['Ürün Adı'] || '',
            quantity: quantity,
            unitCost: cost,
            totalCost: cost * quantity,
            status: row['Order Status'] || row['order-status'] || row['Durum'] || '',
            date: row['Purchase Date'] || row['purchase-date'] || ''
        };
    }).filter(i => i.asin && i.asin.length > 0);

    console.log('Valid FBA items after filter:', fbaItems.length);

    // Merge by SKU (primary) or ASIN (fallback)
    const productMap = new Map();

    const getProduct = (item) => {
        const key = item.sku || item.asin;
        if (!productMap.has(key)) {
            productMap.set(key, {
                asin: item.asin,
                sku: item.sku,
                urun: item.productName.substring(0, 60) + (item.productName.length > 60 ? '...' : ''),
                marka: extractBrand(item.productName),
                fbaAdet: 0, fbaTutar: 0,
                dfAdet: 0, dfTutar: 0,
                toplamAdet: 0, toplamTutar: 0,
                kanal: ''
            });
        }
        return productMap.get(key);
    };

    // Process DF
    dfItems.forEach(item => {
        const p = getProduct(item);
        p.dfAdet += item.quantity;
        p.dfTutar += item.totalCost;
    });

    // Process FBA
    fbaItems.forEach(item => {
        const p = getProduct(item);
        p.fbaAdet += item.quantity;
        p.fbaTutar += item.totalCost;
    });

    // Final calculations per product
    productMap.forEach(p => {
        p.toplamAdet = p.fbaAdet + p.dfAdet;
        p.toplamTutar = p.fbaTutar + p.dfTutar;
        if (p.fbaAdet > 0 && p.dfAdet > 0) p.kanal = 'Her İkisi';
        else if (p.fbaAdet > 0) p.kanal = 'FBA';
        else p.kanal = 'DF';
    });

    const allProducts = Array.from(productMap.values());
    const bothChannelProducts = allProducts.filter(p => p.kanal === 'Her İkisi');

    console.log('Total unique products:', allProducts.length);
    console.log('Products in both channels:', bothChannelProducts.length);

    // Aggregate Metrics
    const metrics = {
        toplamAsin: productMap.size,
        asinFba: allProducts.filter(p => p.kanal === 'FBA').length,
        asinDf: allProducts.filter(p => p.kanal === 'DF').length,
        asinBoth: bothChannelProducts.length,

        fbaAdet: allProducts.reduce((sum, p) => sum + p.fbaAdet, 0),
        dfAdet: allProducts.reduce((sum, p) => sum + p.dfAdet, 0),
        toplamAdet: allProducts.reduce((sum, p) => sum + p.toplamAdet, 0),

        fbaTutar: allProducts.reduce((sum, p) => sum + p.fbaTutar, 0),
        dfTutar: allProducts.reduce((sum, p) => sum + p.dfTutar, 0),
        toplamTutar: allProducts.reduce((sum, p) => sum + p.toplamTutar, 0),
    };

    console.log('Calculated metrics:', metrics);

    // Aggregate Kanal Data (for Doughnut)
    const kanalData = [
        { kanal: 'Sadece FBA', asin: metrics.asinFba },
        { kanal: 'Sadece DF', asin: metrics.asinDf },
        { kanal: 'Her İkisi', asin: metrics.asinBoth }
    ];

    // Aggregate Brand Data
    const brandMap = new Map();
    allProducts.forEach(p => {
        const b = p.marka || 'Diğer';
        if (!brandMap.has(b)) brandMap.set(b, { marka: b, fbaTutar: 0, dfTutar: 0, toplamTutar: 0 });
        const bm = brandMap.get(b);
        bm.fbaTutar += p.fbaTutar;
        bm.dfTutar += p.dfTutar;
        bm.toplamTutar += p.toplamTutar;
    });
    const markaData = Array.from(brandMap.values()).sort((a, b) => b.toplamTutar - a.toplamTutar);

    // Aggregate Category Data (simple brand-based grouping for now)
    const categoryMap = new Map();
    categoryMap.set('Otomotiv', { kategori: 'Otomotiv', toplamTutar: metrics.toplamTutar });
    const categoryData = Array.from(categoryMap.values());

    return {
        products: allProducts.sort((a, b) => b.toplamAdet - a.toplamAdet).slice(0, 50),
        both: bothChannelProducts.sort((a, b) => b.toplamAdet - a.toplamAdet).slice(0, 30),
        metrics: metrics,
        kanalData: kanalData,
        marka: markaData.slice(0, 15),
        kategori: categoryData
    };
}

function parseMoney(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;

    let v = value.toString();

    // Remove currency symbols and text like "TRY "
    v = v.replace(/TRY\s*/gi, '').replace(/₺/g, '').trim();

    // Handle Turkish number format: "186,95" or "1.234,56"
    // Check if comma is the decimal separator (Turkish format)
    if (v.includes(',')) {
        // Remove thousand separators (dots in Turkish format)
        v = v.replace(/\./g, '');
        // Replace comma with dot for decimal
        v = v.replace(',', '.');
    }

    const result = parseFloat(v) || 0;
    return result;
}

function extractBrand(name) {
    if (!name) return 'Bilinmiyor';
    // Common brand patterns in the data
    const brandPatterns = [
        'BOSCH', 'OSRAM', 'PHOTON', 'LIQUI MOLY', 'NGK', 'DENSO',
        'WINKEL', 'NETEX', 'TRW', 'BREMBO', 'VALEO', 'HELLA',
        'NIKEN', 'MARS', 'AYFAR', 'DELPHI', 'KALE'
    ];

    const upperName = name.toUpperCase();
    for (const brand of brandPatterns) {
        if (upperName.includes(brand)) {
            return brand;
        }
    }

    // Fallback: first word
    return name.split(' ')[0].toUpperCase();
}
