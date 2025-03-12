const officialRateElement = document.getElementById('official-rate');
const parallelRateElement = document.getElementById('parallel-rate');
const averageRateElement = document.getElementById('average-rate');
const updateTimeElement = document.getElementById('update-time');
const currentYearElement = document.getElementById('current-year');
const bsToUsdButton = document.getElementById('bs-to-usd');
const usdToBsButton = document.getElementById('usd-to-bs');
const amountInput = document.getElementById('amount-input');
const resultElement = document.getElementById('result');
const copyButton = document.getElementById('copy-result');
const themeToggle = document.getElementById('theme-toggle');
const customRateInput = document.getElementById('custom-rate-input');
const customRateValue = document.getElementById('custom-rate-value');

let officialRate = 0;
let averageRate = 0;
let parallelRate = 0;
let currentRate = 0;
let currentMode = 'bs-to-usd';

currentYearElement.textContent = new Date().getFullYear();

async function fetchRates() {
    try {
        const officialResponse = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const officialData = await officialResponse.json();
        const parallelResponse = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
        const parallelData = await parallelResponse.json();

        averageRate = (officialData.promedio + parallelData.promedio) / 2;

        officialRate = officialData.promedio;
        parallelRate = parallelData.promedio;

        officialRateElement.textContent = `Bs. ${officialRate.toFixed(2)}`;
        parallelRateElement.textContent = `Bs. ${parallelRate.toFixed(2)}`;
        averageRateElement.textContent = `Bs. ${averageRate.toFixed(2)}`;
        
        const updateTime = new Date(officialData.fechaActualizacion);
        updateTimeElement.innerHTML = `<strong>Última actualización:</strong><br>${updateTime.toLocaleString('es-VE', { timeZone: 'America/Caracas' })}`;

        updateCurrentRate();
    } catch (error) {
        console.error('Error fetching rates:', error);
        officialRateElement.textContent = 'Error al cargar';
        parallelRateElement.textContent = 'Error al cargar';
        averageRateElement.textContent = 'Error al cargar';
    }
}

function updateCurrentRate() {
    const selectedRate = document.querySelector('.rate-button.active').dataset.rate;
    if (selectedRate === 'custom') {
        customRateInput.style.display = 'block';
        currentRate = parseFloat(customRateValue.value) || 0;
    } else {
        customRateInput.style.display = 'none';
        switch (selectedRate) {
            case 'official':
                currentRate = officialRate;
                break;
            case 'average':
                currentRate = averageRate;
                break;
            case 'parallel':
                currentRate = parallelRate;
                break;
        }
    }
    calculate();
}

function calculate() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) {
        resultElement.textContent = 'Por favor, ingrese un monto válido.';
        return;
    }

    let result;
    if (currentMode === 'bs-to-usd') {
        result = amount / currentRate;
        resultElement.textContent = `${amount.toFixed(2)} Bs = $${result.toFixed(2)}`;
    } else {
        result = amount * currentRate;
        resultElement.textContent = `$${amount.toFixed(2)} = ${result.toFixed(2)} Bs`;
    }
}

copyButton.addEventListener('click', () => {
    const selectedRate = document.querySelector('.rate-button.active').dataset.rate;
    let rateValue;
    let rateTypeText;
    
    if (selectedRate === 'custom') {
        rateValue = parseFloat(customRateValue.value) || 0;
        rateTypeText = `Dólar Personalizado (Bs. ${rateValue.toFixed(2)})`;
    } else {
        rateValue = {
            'official': officialRate,
            'average': averageRate,
            'parallel': parallelRate
        }[selectedRate];
        
        rateTypeText = {
            'official': `Dólar Oficial BCV`,
            'average': `Dólar Promedio`,
            'parallel': `Dólar Paralelo`
        }[selectedRate];
    }
    
    // Parse the current result to get the values
    const resultText = resultElement.textContent;
    let calculatedResult = '';
    let amount, convertedAmount;
    
    if (currentMode === 'bs-to-usd') {
        const match = resultText.match(/(\d+\.\d+)\s+Bs\s+=\s+\$(\d+\.\d+)/);
        if (match) {
            amount = match[1];
            convertedAmount = match[2];
            calculatedResult = `📌 ¡ Calculado en https://dolarito.online !\n*$ ${convertedAmount} USD* equivalen a *Bs ${amount}*\nTasa De Cambio Aplicada: *Bs ${rateValue.toFixed(2)}*\n\n¿Necesitas verificar otra cantidad?\n¡Visitanos ya! 😊`;
        }
    } else {
        const match = resultText.match(/\$(\d+\.\d+)\s+=\s+(\d+\.\d+)\s+Bs/);
        if (match) {
            amount = match[1];
            convertedAmount = match[2];
            calculatedResult = `📌 ¡ Calculado en https://dolarito.online !\n*$ ${amount} USD* equivalen a *Bs ${convertedAmount}*\nTasa De Cambio Aplicada: *Bs ${rateValue.toFixed(2)}*\n\n¿Necesitas verificar otra cantidad?\n¡Visitanos ya! 😊`;
        }
    }
    
    const shareText = encodeURIComponent(calculatedResult);
    const whatsappUrl = `https://wa.me/?text=${shareText}`;
    
    window.open(whatsappUrl, '_blank');
});

bsToUsdButton.addEventListener('click', () => {
    currentMode = 'bs-to-usd';
    amountInput.placeholder = 'Ingrese monto en Bolívares';
    calculate();
});

usdToBsButton.addEventListener('click', () => {
    currentMode = 'usd-to-bs';
    amountInput.placeholder = 'Ingrese monto en Dólares';
    calculate();
});

amountInput.addEventListener('input', calculate);

const rateButtons = document.querySelectorAll('.rate-button');
rateButtons.forEach(button => {
    button.addEventListener('click', () => {
        rateButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateCurrentRate();
    });
});

customRateValue.addEventListener('input', updateCurrentRate);

document.addEventListener('DOMContentLoaded', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
        document.body.classList.toggle('dark-mode', savedTheme === 'true');
        themeToggle.checked = savedTheme === 'true';
    } else {
        document.body.classList.toggle('dark-mode', prefersDark.matches);
        themeToggle.checked = prefersDark.matches;
    }
    
    // Check if mobile and adjust styles if needed
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        const header = document.querySelector('header h1');
        if (header) {
            header.style.fontSize = '1.5rem';
        }
    }
    
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', themeToggle.checked);
        localStorage.setItem('darkMode', themeToggle.checked);
    });
});

fetchRates();
setInterval(fetchRates, 300000); // Actualiza cada 5 minutos
