
let scrapeButtonElement = document.getElementById('scrapeButton');

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
  }).then(injectionResults => {
    for (const frameResult of injectionResults) {
      document.getElementById('result').innerText = JSON.stringify(frameResult.result, null, 2);
    }
  });
})