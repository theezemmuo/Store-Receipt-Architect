// Run immediately (script is at end of body)
(function () {
    // Elements
    const storeNameInput = document.getElementById('store-name');
    const storeAddressInput = document.getElementById('store-address');
    const taxRateInput = document.getElementById('tax-rate');
    const logoUpload = document.getElementById('logo-upload');
    const logoSizeInput = document.getElementById('logo-size');

    // Receipt Elements
    const receiptStoreName = document.getElementById('receipt-store-name');
    const receiptAddress = document.getElementById('receipt-address');
    const receiptItemsContainer = document.getElementById('receipt-items');
    const receiptSubtotal = document.getElementById('receipt-subtotal');
    const receiptTax = document.getElementById('receipt-tax');
    const receiptTotal = document.getElementById('receipt-total');
    const itemCountSpan = document.getElementById('item-count');
    const tcNumberSpan = document.getElementById('tc-number');
    const receiptDateDiv = document.getElementById('receipt-date');
    const receiptLogoContainer = document.getElementById('receipt-logo-container');
    const receiptLogo = document.getElementById('receipt-logo');

    // Date/Time Inputs
    const dateInput = document.getElementById('receipt-date-input');
    const timeInput = document.getElementById('receipt-time-input');

    // Check critical elements
    if (!storeNameInput || !receiptStoreName || !dateInput) {
        console.error("Critical elements missing");
        alert("Critical elements missing from HTML. Please refresh.");
        return;
    }

    // --- Navigation & View Switching --- //
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.dataset.view;

            // Update Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch View
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `view-${targetView}`) {
                    view.classList.add('active');
                }
            });

            // Special Actions: Refresh table if history view
            if (targetView === 'history') {
                renderHistoryTable();
            }
        });
    });

    // --- Functions --- //

    function switchToCreateView() {
        const createNav = document.querySelector('.nav-item[data-view="create"]');
        if (createNav) createNav.click();
    }

    function resetAll() {
        if (!confirm('Are you sure you want to clear everything?')) return;

        storeNameInput.value = '';
        storeAddressInput.value = '';
        taxRateInput.value = '';
        logoUpload.value = '';
        logoSizeInput.value = '150';

        setDefaultDateTime();

        receiptLogo.src = '';
        receiptLogoContainer.style.display = 'none';

        const container = document.getElementById('items-container');
        container.innerHTML = `
            <div class="item-row">
                <input type="text" class="item-name" placeholder="Item Name">
                <input type="number" class="item-price" placeholder="0.00" step="0.01">
                <button type="button" class="remove-item-btn" onclick="removeItem(this)">×</button>
            </div>
        `;

        attachItemListeners();
        updateReceiptHeader();
        generateRandomTC();
        updateReceiptItems();
    }

    function setDefaultDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        if (dateInput) dateInput.value = `${year}-${month}-${day}`;
        if (timeInput) timeInput.value = `${hours}:${minutes}`;
        updateDate();
    }

    function saveReceiptToHistory() {
        const items = [];
        let total = 0;
        document.querySelectorAll('#items-container .item-row').forEach(row => {
            const name = row.querySelector('.item-name').value;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            items.push({ name, price });
            total += price;
        });

        // Add tax
        const taxRate = parseFloat(taxRateInput.value) || 0;
        const taxAmount = total * (taxRate / 100);
        const finalTotal = total + taxAmount;

        const receiptData = {
            id: Date.now(),
            storeName: storeNameInput.value,
            storeAddress: storeAddressInput.value,
            taxRate: taxRateInput.value,
            logoSize: logoSizeInput.value,
            logoSrc: receiptLogo.src,
            date: dateInput.value,
            time: timeInput.value,
            items: items,
            total: finalTotal.toFixed(2),
            timestamp: new Date().toLocaleString()
        };

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('receipt_history') || '[]');
        } catch (e) {
            history = [];
        }

        history.unshift(receiptData);
        if (history.length > 50) history = history.slice(0, 50); // Increased limit

        try {
            localStorage.setItem('receipt_history', JSON.stringify(history));
            renderHistoryTable(); // Update table if open
        } catch (e) {
            console.error('Storage full or error', e);
        }
    }

    // Replaces renderRecentReceipts
    function renderHistoryTable() {
        const tbody = document.getElementById('history-list-body');
        const emptyState = document.getElementById('history-empty');
        const tableHeader = document.querySelector('.history-table'); // Get table itself
        if (!tbody) return;

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('receipt_history') || '[]');
        } catch (e) {
            history = [];
        }

        if (history.length === 0) {
            tbody.innerHTML = '';
            tableHeader.style.display = 'none'; // Hide table header/structure
            emptyState.style.display = 'flex'; // Show flex for column layout
            return;
        }

        emptyState.style.display = 'none';
        tableHeader.style.display = 'table'; // Restore table
        tbody.innerHTML = '';

        history.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.storeName || 'Unnamed Store'}</strong></td>
                <td>${item.timestamp}</td>
                <td>$${item.total || '0.00'}</td>
                <td>
                    <button class="action-btn-link" onclick="loadReceipt(${item.id})" title="Edit Receipt">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="action-btn-link" onclick="deleteReceipt(${item.id})" style="color: #d93025;" title="Delete Receipt">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Toast Notification System
    window.showToast = function (message, type = 'normal') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;

        let icon = 'ph-check-circle';
        if (type === 'error') icon = 'ph-warning-circle';
        if (type === 'info') icon = 'ph-info';

        toast.innerHTML = `
            <i class="ph ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Remove after 3s
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    window.deleteReceipt = function (id) {
        // Use confirm or custom dialog (native confirm is ok for destructive action if user okay with it, 
        // but user asked for toasts instead of alerts. For deletions, confirmation is usually still good practice.
        // We'll keep confirm for safety, but show toast after.)
        if (!confirm('Delete this receipt from history?')) return;

        let history = JSON.parse(localStorage.getItem('receipt_history') || '[]');
        history = history.filter(item => item.id !== id);
        localStorage.setItem('receipt_history', JSON.stringify(history));
        renderHistoryTable();
        showToast('Receipt deleted from history');
    };

    window.loadReceipt = function (id) {
        // ... (loading logic) ...
        // We already have the logic, just adding toast at the end of successful load if needed
        // But logic is below, let's just intercept the function call or update this block.
        // Updating this block:

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('receipt_history') || '[]');
        } catch (e) { return; }

        const item = history.find(i => i.id === id);
        if (!item) return;

        switchToCreateView();

        storeNameInput.value = item.storeName || '';
        storeAddressInput.value = item.storeAddress || '';
        taxRateInput.value = item.taxRate || '';
        logoSizeInput.value = item.logoSize || '150';
        if (dateInput) dateInput.value = item.date || '';
        if (timeInput) timeInput.value = item.time || '';

        if (item.logoSrc && item.logoSrc.startsWith('data:')) {
            receiptLogo.src = item.logoSrc;
            receiptLogoContainer.style.display = 'flex';
        } else {
            receiptLogo.src = '';
            receiptLogoContainer.style.display = 'none';
        }

        const itemsContainer = document.getElementById('items-container');
        itemsContainer.innerHTML = '';

        if (item.items && item.items.length > 0) {
            item.items.forEach(i => {
                const row = document.createElement('div');
                row.className = 'item-row';
                row.innerHTML = `
                    <input type="text" class="item-name" placeholder="Item Name" value="${i.name || ''}">
                    <input type="number" class="item-price" placeholder="0.00" step="0.01" value="${i.price || ''}">
                    <button type="button" class="remove-item-btn" onclick="removeItem(this)">×</button>
                `;
                itemsContainer.appendChild(row);
            });
        } else {
            itemsContainer.innerHTML = `
                <div class="item-row">
                    <input type="text" class="item-name" placeholder="Item Name">
                    <input type="number" class="item-price" placeholder="0.00" step="0.01">
                    <button type="button" class="remove-item-btn" onclick="removeItem(this)">×</button>
                </div>
            `;
        }

        attachItemListeners();
        updateReceiptHeader();
        updateDate();
        updateLogoSize();
        updateReceiptItems();

        showToast('Receipt loaded successfully');
    };

    function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                receiptLogo.src = event.target.result;
                receiptLogoContainer.style.display = 'flex';
                updateLogoSize();
            };
            reader.readAsDataURL(file);
        } else {
            receiptLogoContainer.style.display = 'none';
        }
    }

    function updateLogoSize() {
        const width = logoSizeInput.value;
        receiptLogo.style.width = width + 'px';
    }

    function updateReceiptHeader() {
        receiptStoreName.textContent = storeNameInput.value || 'STORE NAME';
        receiptStoreName.style.display = storeNameInput.value ? 'block' : 'none';
        receiptAddress.innerHTML = (storeAddressInput.value || 'Store Address\nCity, State Zip').replace(/\n/g, '<br>');
    }

    function updateDate() {
        if (!dateInput || !timeInput) return;
        const dateVal = dateInput.value;
        const timeVal = timeInput.value;

        if (!dateVal || !timeVal) return;

        const dateObj = new Date(`${dateVal}T${timeVal}`);
        if (isNaN(dateObj.getTime())) return;

        const options = {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        };
        try {
            let formatted = dateObj.toLocaleString('en-US', options).toUpperCase();
            receiptDateDiv.textContent = formatted;
        } catch (e) {
            console.error(e);
        }
    }

    function generateRandomTC() {
        const num = Math.floor(Math.random() * 10000000000000000000).toString().padStart(20, '0');
        const parts = num.match(/.{1,4}/g).join(' ');
        document.getElementById('tc-number').textContent = parts;
    }

    function addItem() {
        const container = document.getElementById('items-container');
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.innerHTML = `
            <input type="text" class="item-name" placeholder="Item Name">
            <input type="number" class="item-price" placeholder="Price" step="0.01">
            <button type="button" class="remove-item-btn" onclick="removeItem(this)">×</button>
        `;
        container.appendChild(newItem);
        attachItemListeners();
    }

    window.removeItem = function (btn) {
        btn.closest('.item-row').remove();
        updateReceiptItems();
    };

    function attachItemListeners() {
        const nameInputs = document.querySelectorAll('.item-name');
        const priceInputs = document.querySelectorAll('.item-price');

        nameInputs.forEach(input => {
            input.removeEventListener('input', updateReceiptItems);
            input.addEventListener('input', updateReceiptItems);
        });

        priceInputs.forEach(input => {
            input.removeEventListener('input', updateReceiptItems);
            input.addEventListener('input', updateReceiptItems);
        });
    }

    function updateReceiptItems() {
        const itemRows = document.querySelectorAll('.item-row');
        let subtotal = 0;
        let count = 0;

        receiptItemsContainer.innerHTML = '';

        itemRows.forEach(row => {
            const name = row.querySelector('.item-name').value;
            const priceVal = row.querySelector('.item-price').value;
            const price = parseFloat(priceVal);

            if (name || priceVal) {
                const displayPrice = isNaN(price) ? '0.00' : price.toFixed(2);

                const itemDiv = document.createElement('div');
                itemDiv.className = 'receipt-item';
                itemDiv.innerHTML = `
                    <span class="receipt-item-name">${name || 'Item'}</span>
                    <span class="receipt-item-price">$${displayPrice}</span>
                `;
                receiptItemsContainer.appendChild(itemDiv);

                if (!isNaN(price)) {
                    subtotal += price;
                }
                count++;
            }
        });

        const taxRate = parseFloat(taxRateInput.value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        receiptSubtotal.textContent = formatMoney(subtotal);
        receiptTax.textContent = formatMoney(taxAmount);
        receiptTotal.textContent = formatMoney(total);
        itemCountSpan.textContent = count;

        let realisticCash = Math.ceil(total / 10) * 10;
        if (realisticCash < total) realisticCash = total;
        if (total === 0) realisticCash = 0;

        document.getElementById('receipt-cash').textContent = formatMoney(realisticCash);
        document.getElementById('receipt-change').textContent = formatMoney(realisticCash - total);
    }

    function formatMoney(amount) {
        return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Elements
    const downloadFormatSelect = document.getElementById('download-format');

    function downloadReceipt() {
        saveReceiptToHistory();

        const receiptElement = document.getElementById('receipt-preview');
        const format = downloadFormatSelect.value;
        const scale = 3;

        const btn = document.getElementById('download-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Generating...';
        btn.disabled = true;

        html2canvas(receiptElement, {
            scale: scale,
            backgroundColor: '#fffcf5',
            useCORS: true,
            logging: false,
            onclone: (clonedDoc) => {
                const clonedReceipt = clonedDoc.getElementById('receipt-preview');
                clonedReceipt.style.fontFamily = "'Courier New', Courier, monospace";
                const allElements = clonedReceipt.querySelectorAll('*');
                allElements.forEach(el => {
                    el.style.fontFamily = "'Courier New', Courier, monospace";
                });
            }
        }).then(canvas => {
            const filename = `receipt_${new Date().getTime()}`;

            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `${filename}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else if (format === 'jpg') {
                const link = document.createElement('a');
                link.download = `${filename}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgWidth = canvas.width / scale;
                const imgHeight = canvas.height / scale;

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [imgWidth, imgHeight]
                });

                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
                pdf.save(`${filename}.pdf`);
            }

            btn.textContent = originalText;
            btn.disabled = false;
            showToast('Receipt downloaded successfully');
        }).catch(err => {
            console.error('Download failed', err);
            showToast('Download failed: ' + err, 'error');
            btn.textContent = 'Error';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        });
    }

    // Initial Setup
    updateReceiptHeader();
    if (!dateInput.value) setDefaultDateTime();
    generateRandomTC();
    updateReceiptItems();

    // Check history (doesn't need to render unless on history view)
    // renderHistoryTable() is called when clicking the tab

    // Event Listeners
    storeNameInput.addEventListener('input', updateReceiptHeader);
    storeAddressInput.addEventListener('input', updateReceiptHeader);
    taxRateInput.addEventListener('input', updateReceiptItems);

    logoUpload.addEventListener('change', handleLogoUpload);
    logoSizeInput.addEventListener('input', updateLogoSize);

    document.getElementById('add-item-btn').addEventListener('click', addItem);
    document.getElementById('download-btn').addEventListener('click', downloadReceipt);
    document.getElementById('reset-btn').addEventListener('click', resetAll);

    dateInput.addEventListener('change', updateDate);
    dateInput.addEventListener('input', updateDate);
    timeInput.addEventListener('change', updateDate);
    timeInput.addEventListener('input', updateDate);

    attachItemListeners();

})();
