/**
 * UI Helper Functions
 */

export function formatNum(n) {
    if (n === undefined || n === null) return '-';
    return n.toLocaleString('tr-TR');
}

export function formatMoney(n) {
    if (n === undefined || n === null) return '-';
    return '₺' + (n / 1000000).toFixed(2).replace('.', ',') + 'M';
}

export function getChannelBadge(kanal) {
    if (kanal === 'Her İkisi') return '<span class="channel-badge channel-both">Her İkisi</span>';
    if (kanal === 'FBA') return '<span class="channel-badge channel-fba">FBA</span>';
    return '<span class="channel-badge channel-df">DF</span>';
}

export function updateTables(data) {
    // Adet bazlı sıralama
    const byAdet = [...data.products].sort((a, b) => b.toplamAdet - a.toplamAdet);
    const topAdetBody = document.getElementById('topAdetBody');
    if (topAdetBody) {
        topAdetBody.innerHTML = byAdet.map((p, i) => `<tr>
            <td>${i+1}</td>
            <td class="sku-cell">${p.sku}</td>
            <td>${p.urun}</td>
            <td>${p.marka}</td>
            <td>${getChannelBadge(p.kanal)}</td>
            <td class="fba-color">${p.fbaAdet > 0 ? p.fbaAdet : '-'}</td>
            <td class="df-color">${p.dfAdet > 0 ? p.dfAdet : '-'}</td>
            <td style="color:#9b59b6;font-weight:bold">${p.toplamAdet}</td>
            <td>₺${p.toplamTutar.toLocaleString('tr-TR')}</td>
        </tr>`).join('');
    }

    // Tutar bazlı sıralama
    const byTutar = [...data.products].sort((a, b) => b.toplamTutar - a.toplamTutar);
    const topTutarBody = document.getElementById('topTutarBody');
    if (topTutarBody) {
        topTutarBody.innerHTML = byTutar.map((p, i) => `<tr>
            <td>${i+1}</td>
            <td class="sku-cell">${p.sku}</td>
            <td>${p.urun}</td>
            <td>${p.marka}</td>
            <td>${getChannelBadge(p.kanal)}</td>
            <td class="fba-color">${p.fbaTutar > 0 ? '₺' + p.fbaTutar.toLocaleString('tr-TR') : '-'}</td>
            <td class="df-color">${p.dfTutar > 0 ? '₺' + p.dfTutar.toLocaleString('tr-TR') : '-'}</td>
            <td style="color:#9b59b6;font-weight:bold">₺${p.toplamTutar.toLocaleString('tr-TR')}</td>
            <td>${p.toplamAdet}</td>
        </tr>`).join('');
    }

    // Her iki kanalda
    const bothBody = document.getElementById('bothBody');
    if (bothBody && data.both) {
        bothBody.innerHTML = data.both.map((p, i) => `<tr>
            <td>${i+1}</td>
            <td class="sku-cell">${p.sku}</td>
            <td>${p.urun}</td>
            <td>${p.marka}</td>
            <td class="fba-color">${p.fbaAdet}</td>
            <td class="fba-color">₺${p.fbaTutar.toLocaleString('tr-TR')}</td>
            <td class="df-color">${p.dfAdet}</td>
            <td class="df-color">₺${p.dfTutar.toLocaleString('tr-TR')}</td>
            <td style="color:#2ecc71;font-weight:bold">${p.toplamAdet} / ₺${p.toplamTutar.toLocaleString('tr-TR')}</td>
        </tr>`).join('');
    }
}

export function updateSummaryBoxes(metrics) {
    document.getElementById('fbaAdetBox').textContent = formatNum(metrics.fbaAdet);
    document.getElementById('fbaTutarBox').textContent = formatMoney(metrics.fbaTutar);
    document.getElementById('dfAdetBox').textContent = formatNum(metrics.dfAdet);
    document.getElementById('dfTutarBox').textContent = formatMoney(metrics.dfTutar);
    document.getElementById('toplamAdetBox').textContent = formatNum(metrics.toplamAdet);
    document.getElementById('toplamTutarBox').textContent = formatMoney(metrics.toplamTutar);

    // Metric cards
    document.getElementById('metricToplamAsin').textContent = formatNum(metrics.toplamAsin);
    document.getElementById('metricAsinFba').textContent = formatNum(metrics.asinFba);
    document.getElementById('metricAsinDf').textContent = formatNum(metrics.asinDf);
    document.getElementById('metricAsinBoth').textContent = formatNum(metrics.asinBoth);

    document.getElementById('metricToplamAdet').textContent = formatNum(metrics.toplamAdet);
    document.getElementById('metricFbaAdet').textContent = formatNum(metrics.fbaAdet);
    document.getElementById('metricDfAdet').textContent = formatNum(metrics.dfAdet);
    
    document.getElementById('metricToplamTutar').textContent = formatMoney(metrics.toplamTutar);
    document.getElementById('metricFbaTutar').textContent = formatMoney(metrics.fbaTutar);
    document.getElementById('metricDfTutar').textContent = formatMoney(metrics.dfTutar);
    
    document.getElementById('metricOrtakUrun').textContent = formatNum(metrics.asinBoth);

    const fbaPay = metrics.toplamAdet > 0 ? Math.round(metrics.fbaAdet / metrics.toplamAdet * 100 * 10) / 10 : 0;
    const dfPay = metrics.toplamAdet > 0 ? Math.round(metrics.dfAdet / metrics.toplamAdet * 100 * 10) / 10 : 0;
    
    document.getElementById('metricFbaPay').textContent = '%' + fbaPay;
    document.getElementById('metricFbaPaySub').textContent = formatNum(metrics.fbaAdet) + ' / ' + formatNum(metrics.toplamAdet);
    document.getElementById('metricDfPay').textContent = '%' + dfPay;
    document.getElementById('metricDfPaySub').textContent = formatNum(metrics.dfAdet) + ' / ' + formatNum(metrics.toplamAdet);
}
