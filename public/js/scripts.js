// scripts.js

// Example: Toggle sidebar on smaller screens
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.querySelector('#sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
});

// Example: Notification fadeout after a few seconds
setTimeout(() => {
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(msg => {
        msg.style.transition = 'opacity 1s';
        msg.style.opacity = 0;
        setTimeout(() => msg.remove(), 1000);
    });
}, 3000);
function filterTransactions() {
    const searchInput = document.getElementById('searchTransaction').value.toLowerCase();
    const tableRows = document.getElementById('transactionTableBody').getElementsByTagName('tr');

    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const description = row.cells[1]?.textContent.toLowerCase();
        if (description && description.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}
function editBudget(category, limit) {
    const categoryInput = document.getElementById('category');
    const limitInput = document.getElementById('limit');

    categoryInput.value = category;
    limitInput.value = limit;

    window.scrollTo({ top: document.getElementById('budgetForm').offsetTop, behavior: 'smooth' });
}

async function fetchPortfolio() {
    const response = await fetch("/api/portfolio");
    const data = await response.json();
    const portfolioElement = document.querySelector(".portfolio ul");
  
    portfolioElement.innerHTML = "";
    data.holdings.forEach(item => {
      portfolioElement.innerHTML += `<li><strong>${item.coin}</strong>: ${item.amount} ($${item.value})</li>`;
    });
  }
  
  setInterval(fetchPortfolio, 60000); // Refresh every minute
  