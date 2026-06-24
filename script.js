// Cash Flow Dashboard - Sprint 02
// vanilla js, no framework as per instructions

// salary stuff
var salaryForm = document.getElementById("salaryForm");
var salaryInput = document.getElementById("salaryInput");
var salaryDisplay = document.getElementById("salaryDisplay");

// expense stuff
var expenseForm = document.getElementById("expenseForm");
var expenseName = document.getElementById("expenseName");
var expenseAmount = document.getElementById("expenseAmount");
var expenseList = document.getElementById("expenseList");

var balanceDisplay = document.getElementById("balanceDisplay");
var errorBox = document.getElementById("errorBox");

// state
var totalSalary = 0;
var expenses = []; //array of objects {id, name, amount}
var chartObj = null; //chart.js instance, null means not created yet

// load saved data when page opens
function loadFromStorage() {
  var savedSalary = localStorage.getItem("totalSalary");
  var savedExpenses = localStorage.getItem("expenses");

  if (savedSalary) {
    totalSalary = parseFloat(savedSalary);
    salaryDisplay.textContent = totalSalary;
  }

  if (savedExpenses) {
    expenses = JSON.parse(savedExpenses);
    for (var i = 0; i < expenses.length; i++) {
      renderExpenseItem(expenses[i]);
    }
  }

  updateBalance();
  console.log("loaded data:", expenses); //debug
}

function saveToStorage() {
  localStorage.setItem("totalSalary", totalSalary);
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");

  setTimeout(function () {
    errorBox.classList.add("hidden");
  }, 3000); //hide after 3 sec
}

// salary form
salaryForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var value = parseFloat(salaryInput.value);

  if (isNaN(value) || value <= 0) {
    showError("Please enter a valid salary amount.");
    return;
  }

  totalSalary = value;
  salaryDisplay.textContent = totalSalary;
  salaryInput.value = "";

  saveToStorage();
  updateBalance();
});

// expense form
expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var nameVal = expenseName.value.trim();
  var amt = parseFloat(expenseAmount.value);

  if (nameVal == "" || isNaN(amt) || amt <= 0) {
    showError("Please enter a valid expense name and amount.");
    return;
  }

  var newExpense = {
    id: Date.now(), //using timestamp as unique id, good enough for this project
    name: nameVal,
    amount: amt
  };

  expenses.push(newExpense);
  renderExpenseItem(newExpense);

  expenseName.value = "";
  expenseAmount.value = "";

  saveToStorage();
  updateBalance();
});

function renderExpenseItem(expense) {
  var li = document.createElement("li");
  li.setAttribute("data-id", expense.id);

  var textSpan = document.createElement("span");
  textSpan.textContent = expense.name + " - ₹" + expense.amount;

  var delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "delete-btn";

  delBtn.addEventListener("click", function () {
    deleteExpense(expense.id, li);
  });

  li.appendChild(textSpan);
  li.appendChild(delBtn);
  expenseList.appendChild(li);
}

function deleteExpense(id, liElement) {
  var newArr = [];
  for (var i = 0; i < expenses.length; i++) {
    if (expenses[i].id != id) {
      newArr.push(expenses[i]);
    }
  }
  expenses = newArr;

  liElement.remove();

  saveToStorage();
  updateBalance();
}

function updateBalance() {
  var totalExp = 0;
  for (var i = 0; i < expenses.length; i++) {
    totalExp += expenses[i].amount;
  }

  var bal = totalSalary - totalExp;
  balanceDisplay.textContent = bal;

  // turn balance red if it goes below 10% of salary
  if (totalSalary > 0 && bal < totalSalary * 0.1) {
    balanceDisplay.classList.add("low");
  } else {
    balanceDisplay.classList.remove("low");
  }

  updateChart(bal, totalExp);
}

function updateChart(bal, totalExp) {
  var ctx = document.getElementById("cashflowChart").getContext("2d");
  var safeBal = bal > 0 ? bal : 0; //chart breaks with negative values so clamp it

  if (chartObj == null) {
    chartObj = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Remaining Balance", "Total Expenses"],
        datasets: [{
          data: [safeBal, totalExp],
          backgroundColor: ["#2d6cdf", "#e74c3c"]
        }]
      }
    });
  } else {
    chartObj.data.datasets[0].data = [safeBal, totalExp];
    chartObj.update();
  }
}

// run when page loads
loadFromStorage();