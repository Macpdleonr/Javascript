
let scrapeButtonElement = document.getElementById('scrapeButton');
let clearButtonElement = document.getElementById('clearButton');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildFormHtml(products) {
  if(!products || products.length === 0) {
    return '<div class=""'
  }
}

scrapeButtonElement.addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true }); 
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      function: () => {
        console.log('Scraping Falabella Products ...');
        let datos = document.querySelectorAll('[data-testid=ssr-pod]')
        datos = [...datos]
        let productos = datos.map((producto) => {
          const [marca, nombreArticulo, quienComercializa, precioArticulo, descuento] = producto.innerText.split("\n")

          return {marca, nombreArticulo, quienComercializa, precioArticulo, descuento}
      })

      return productos;

    }
  }).then((injectionResults) => {
    for (const frameResult of injectionResults) {
      const products = frameResult.result || [];
      const result = document.getElementById('result');
      result.innerHTML = buildFormHtml(products);

      const exportBtn = document.getElementById('exportBtn');
      const copyBtn = document.getElementById('copyBtn');

      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          
          const checked = Array.from(document.querySelectorAll('input[name=selected]:checked')).map(these => products[Number(these.value)]);

          const rows = checked.length ? checked : products;

          const csv = rows.map(r =>[r.marca, r.nombreArticulo, r.quienComercializa, r.precioArticulo, r.descuento].map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(',')).join('\n');

          const csvContent = 'Marca,Nombre Articulo,Quien Comercializa,Precio Articulo,Descuento\n' + csv;
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'productos.csv';
          a.click();
          URL.revokeObjectURL(url);
        });
    }
    if (copyBtn){
      copyBtn.addEventListener('click', async () => {
        const checked = Array.from(document.querySelectorAll('input[name=selected]:checked')).map(these => products[Number(these.value)]);
        const toCopy = checked.length ? checked : products;

        try {
          await navigator.clipboard.writeText(JSON.stringify(toCopy, null, 2));
          copyBtn.textContent = 'Copiado!';
          setTimeout(() => copyBtn.textContent = 'Copiar JSON', 1500);
        } catch (err) {
          console.error("Failed to copy: ", err);
        }
      });
    }
  }
});

});