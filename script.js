// ======================================================
// 2015TEAMWORK SAVINGS MANAGER
// COMPLETE JAVASCRIPT SYSTEM
// ======================================================


// ======================================================
// 1. DATA STORAGE
// ======================================================

// These use new storage names to protect older records.

function loadData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

let members = loadData("teamwork2026Members");
let savings = loadData("teamwork2026Savings");
let welfare = loadData("teamwork2026Welfare");
let loans = loadData("teamwork2026Loans");
let expenses = loadData("teamwork2026Expenses");
let editingExpenseId = null;


// ======================================================
// 2. GENERAL FUNCTIONS
// ======================================================

function formatMoney(amount) {
    return "UGX " + Number(amount || 0).toLocaleString("en-US");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];
    });
}

function today() {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];
}

function makeID(prefix) {
    return prefix + Date.now() + Math.floor(Math.random() * 1000);
}


// ======================================================
// 3. PAGE NAVIGATION
// ======================================================

const pageNames = {
    dashboardPage: "Dashboard",
    membersPage: "Members Management",
    savingsPage: "Savings Management",
    welfarePage: "Welfare Management",
    loansPage: "Loans Management",
    expensesPage: "Expenses Management",
    reportsPage: "Financial Reports",
    interestPage: "Interest Sharing"
};

function showPage(pageID) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageID);

    if (!selectedPage) {
        console.error("Page not found:", pageID);
        return;
    }

    selectedPage.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(function(button) {
        button.classList.remove("active");

        if (button.dataset.page === pageID) {
            button.classList.add("active");
        }
    });

    document.getElementById("pageTitle").textContent =
        pageNames[pageID] || "2015TEAMWORK";

    if (pageID === "dashboardPage") {
        updateDashboard();
    }

    if (pageID === "membersPage") {
        displayMembers();
    }

    if (pageID === "savingsPage") {
        displaySavings();
    }

    if (pageID === "welfarePage") {
        displayWelfare();
    }

    if (pageID === "loansPage") {
        displayLoans();
    }

    if (pageID === "expensesPage") {
    displayExpenses();
}

    if (pageID === "reportsPage") {
        updateReports();
    }

    if (pageID === "interestPage") {
        renderInterestSharing();
    }
}

document.querySelectorAll(".nav-btn").forEach(function(button) {

    button.addEventListener("click", function() {
        showPage(button.dataset.page);
    });

});


// ======================================================
// 4. CURRENT DATE
// ======================================================

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-UG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });


// ======================================================
// 5. MEMBERS MANAGEMENT
// ======================================================

function generateMemberNumber() {

    let highestNumber = 0;

    members.forEach(function(member) {

        const match = String(member.memberNumber || "")
            .match(/^TW2015(\d+)$/);

        if (match) {
            highestNumber = Math.max(
                highestNumber,
                Number(match[1])
            );
        }

    });

    return "TW2015" + String(highestNumber + 1).padStart(3, "0");
}


function displayMembers(searchTerm = "") {

    const table = document.getElementById("membersTableBody");

    const search = searchTerm.toLowerCase();

    const filteredMembers = members.filter(function(member) {

        return (
            String(member.name || "").toLowerCase().includes(search) ||
            String(member.memberNumber || "").toLowerCase().includes(search) ||
            String(member.phone || "").toLowerCase().includes(search)
        );

    });

    if (filteredMembers.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">No members found.</td>
            </tr>
        `;

        return;
    }

    table.innerHTML = filteredMembers.map(function(member) {

        return `
            <tr>
                <td>${escapeHTML(member.memberNumber)}</td>
                <td>${escapeHTML(member.name)}</td>
                <td>${escapeHTML(member.phone)}</td>
                <td>${escapeHTML(member.dateJoined)}</td>

                <td>
                    <button class="edit-btn"
                        data-action="edit-member"
                        data-id="${escapeHTML(member.id)}">
                        Edit
                    </button>

                    <button class="delete-btn"
                        data-action="delete-member"
                        data-id="${escapeHTML(member.id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    }).join("");

}


document.getElementById("memberForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("memberName").value.trim();
    const phone = document.getElementById("memberPhone").value.trim();
    const dateJoined = document.getElementById("memberDate").value;

    if (!name || !phone || !dateJoined) {
        alert("Please complete all member details.");
        return;
    }

    const member = {
        id: makeID("MEM"),
        memberNumber: generateMemberNumber(),
        name: name,
        phone: phone,
        dateJoined: dateJoined
    };

    members.push(member);


    saveData("teamwork2026Members", members);

    displayMembers();

    updateMemberDropdowns();

    updateDashboard();

    alert("Member registered successfully!\nMember Number: " + member.memberNumber);

});


document.getElementById("memberSearch").addEventListener("input", function() {

    displayMembers(this.value);

});


// ======================================================
// 6. EDIT AND DELETE MEMBERS
// ======================================================

function editMember(id) {

    const member = members.find(function(item) {
        return item.id === id;
    });

    if (!member) return;

    const newName = prompt("Enter member's full name:", member.name);

    if (newName === null) return;

    const newPhone = prompt("Enter member's phone number:", member.phone);

    if (newPhone === null) return;

    if (!newName.trim() || !newPhone.trim()) {
        alert("Name and phone number cannot be empty.");
        return;
    }

    member.name = newName.trim();
    member.phone = newPhone.trim();

    saveData("teamwork2026Members", members);

    displayMembers();
    updateMemberDropdowns();
    displaySavings();
    displayWelfare();
    displayLoans();
    updateDashboard();

    alert("Member details updated successfully.");

}


function deleteMember(id) {

    const hasTransactions =
        savings.some(item => item.memberId === id) ||
        welfare.some(item => item.memberId === id) ||
        loans.some(item => item.memberId === id);

    if (hasTransactions) {
        alert("This member has financial records. You cannot delete the member until the records have been handled.");
        return;
    }

    if (!confirm("Are you sure you want to delete this member?")) {
        return;
    }

    members = members.filter(function(member) {
        return member.id !== id;
    });

    saveData("teamwork2026Members", members);

    displayMembers();
    updateMemberDropdowns();
    updateDashboard();

    alert("Member deleted successfully.");

}

// ======================================================
// 7. MEMBER DROPDOWNS - CORRECTED
// ======================================================

function updateMemberDropdowns() {

    const dropdownIDs = [
        "savingsMember",
        "statementMember",
        "welfareMember",
        "loanMember"
    ];

    dropdownIDs.forEach(function(dropdownID) {

        const dropdown = document.getElementById(dropdownID);

        if (!dropdown) {
            console.warn("Dropdown not found:", dropdownID);
            return;
        }

        const previousValue = dropdown.value;

        dropdown.innerHTML = "";

        const defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Select Member";

        dropdown.appendChild(defaultOption);

        members.forEach(function(member) {

            if (!member.id) return;

            const option = document.createElement("option");

            option.value = String(member.id);

            option.textContent =
                (member.memberNumber || "") + " - " +
                (member.name || "Unnamed Member");

            dropdown.appendChild(option);

        });

        if (
            previousValue &&
            members.some(member =>
                String(member.id) === String(previousValue)
            )
        ) {
            dropdown.value = previousValue;
        }

    });

    console.log("Member dropdowns updated. Members:", members.length);

}

// ======================================================
// 8. SAVINGS MANAGEMENT - ADD AND EDIT
// ======================================================

let editingSavingsId = null;


// DISPLAY SAVINGS RECORDS

function displaySavings() {

    const table = document.getElementById("savingsTableBody");

    if (savings.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No savings records available.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = savings.map(function(record) {

        const member = members.find(
            item => item.id === record.memberId
        );

        return `
            <tr>
                <td>${escapeHTML(member ? member.memberNumber : "Unknown")}</td>

                <td>${escapeHTML(member ? member.name : "Unknown")}</td>

                <td>${escapeHTML(record.date)}</td>

                <td>${formatMoney(record.amount)}</td>

                <td>${escapeHTML(record.description || "-")}</td>

                <td>
                    <button type="button"
                        class="edit-btn"
                        data-action="edit-saving"
                        data-id="${escapeHTML(record.id)}">
                        Edit
                    </button>

                    <button type="button"
                        class="delete-btn"
                        data-action="delete-saving"
                        data-id="${escapeHTML(record.id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    }).join("");

}


// START EDITING A SAVINGS RECORD

function editSaving(id) {

    const record = savings.find(
        item => String(item.id) === String(id)
    );

    if (!record) {
        alert("Savings record not found.");
        return;
    }

    // Refresh member selections first.
    updateMemberDropdowns();

    const memberDropdown = document.getElementById("savingsMember");

    memberDropdown.value = String(record.memberId);

    if (memberDropdown.value !== String(record.memberId)) {
        alert("The member attached to this savings record could not be found.");
        return;
    }

    editingSavingsId = record.id;

    document.getElementById("savingsDate").value = record.date;

    document.getElementById("savingsAmount").value = record.amount;

    document.getElementById("savingsDescription").value =
        record.description || "";

    document.querySelector(
        '#savingsForm button[type="submit"]'
    ).textContent = "Update Savings";

    document.getElementById("savingsForm").scrollIntoView({
        behavior: "smooth"
    });

}


// CANCEL EDITING

function cancelSavingsEdit() {

    editingSavingsId = null;

    document.getElementById("savingsForm").reset();

    document.getElementById("savingsDate").value = today();

    document.querySelector(
        '#savingsForm button[type="submit"]'
    ).textContent = "Record Savings";

}


// SAVE NEW RECORD OR UPDATE EXISTING RECORD

document.getElementById("savingsForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const memberId =
            document.getElementById("savingsMember").value;

        const date =
            document.getElementById("savingsDate").value;

        const amount =
            Number(document.getElementById("savingsAmount").value);

        const description =
            document.getElementById("savingsDescription").value.trim();

        if (!members.some(member => member.id === memberId)) {
            alert("Please select a valid member.");
            return;
        }

        if (!date || !Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid date and amount.");
            return;
        }


        // UPDATE EXISTING RECORD

        if (editingSavingsId !== null) {

            const record = savings.find(
                item => String(item.id) === String(editingSavingsId)
            );

            if (!record) {
                alert("Savings record not found.");
                cancelSavingsEdit();
                return;
            }

            record.memberId = memberId;
            record.date = date;
            record.amount = amount;
            record.description = description;

            saveData("teamwork2026Savings", savings);

            cancelSavingsEdit();

            alert("Savings record updated successfully!");

        }


        // RECORD NEW SAVINGS

        else {

            savings.push({

                id: makeID("SAV"),

                memberId: memberId,

                date: date,

                amount: amount,

                description: description

            });

            saveData("teamwork2026Savings", savings);

            this.reset();

            document.getElementById("savingsDate").value = today();

            alert("Savings recorded successfully.");

        }


        // REFRESH FINANCIAL FIGURES

        displaySavings();

        updateDashboard();

        updateReports();

        if (typeof renderInterestSharing === "function") {
            renderInterestSharing();
        }

    }
);


// ======================================================
// 9. DELETE SAVINGS RECORD
// ======================================================

function deleteSaving(id) {

    if (!confirm("Are you sure you want to delete this savings record?")) {
        return;
    }

    savings = savings.filter(
        record => String(record.id) !== String(id)
    );

    saveData("teamwork2026Savings", savings);

    displaySavings();

    updateDashboard();

    updateReports();

    if (typeof renderInterestSharing === "function") {
        renderInterestSharing();
    }

    alert("Savings record deleted successfully.");

}

// ======================================================
// 10. INDIVIDUAL MEMBER SAVINGS STATEMENT
// ======================================================

function viewMemberSavingsStatement() {

    const memberId = document.getElementById("statementMember").value;

    const output = document.getElementById("memberSavingsStatement");

    const member = members.find(item => item.id === memberId);

    if (!member) {
        alert("Please select a member.");
        return;
    }

    const records = savings.filter(function(record) {
        return record.memberId === memberId;
    });

    const total = records.reduce(function(sum, record) {
        return sum + Number(record.amount);
    }, 0);

    let rows = "";

    records.forEach(function(record) {

        rows += `
            <tr>
                <td>${escapeHTML(record.date)}</td>
                <td>${escapeHTML(record.description || "-")}</td>
                <td>${formatMoney(record.amount)}</td>
            </tr>
        `;

    });

    output.innerHTML = `

        <h3>2015TEAMWORK SAVINGS STATEMENT</h3>

        <p><strong>Member Number:</strong> ${escapeHTML(member.memberNumber)}</p>

        <p><strong>Member Name:</strong> ${escapeHTML(member.name)}</p>

        <p><strong>Phone:</strong> ${escapeHTML(member.phone)}</p>

        <hr>

        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>

            <tbody>
                ${rows || '<tr><td colspan="3">No savings recorded.</td></tr>'}
            </tbody>
        </table>

        <h3>Total Savings: ${formatMoney(total)}</h3>

    `;

}

document.getElementById("viewStatementBtn").addEventListener("click", viewMemberSavingsStatement);


document.getElementById("downloadStatementBtn").addEventListener("click", function() {

    const statement = document.getElementById("memberSavingsStatement");

    if (!statement.innerHTML.trim()) {
        alert("Please view a member statement first.");
        return;
    }

    printContent(
        "Member Savings Statement",
        statement.innerHTML
    );

});

// ======================================================
// 11. WELFARE MANAGEMENT
// ======================================================

let editingWelfareId = null;

function displayWelfare() {

    const table = document.getElementById("welfareTableBody");

    if (!table) return;

    if (welfare.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">No welfare records available.</td>
            </tr>
        `;

        return;
    }

    table.innerHTML = welfare.map(function(record) {

        const member = members.find(item => item.id === record.memberId);

        return `
            <tr>
                <td>${escapeHTML(member ? member.memberNumber : "Unknown")}</td>

                <td>${escapeHTML(member ? member.name : "Unknown")}</td>

                <td>${escapeHTML(record.date)}</td>

                <td>${formatMoney(record.amount)}</td>

                <td>${escapeHTML(record.description || "-")}</td>

                <td>
                    <button class="edit-btn"
                        data-action="edit-welfare"
                        data-id="${escapeHTML(record.id)}">
                        Edit
                    </button>

                    <button class="delete-btn"
                        data-action="delete-welfare"
                        data-id="${escapeHTML(record.id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    }).join("");

}


// ======================================================
// EDIT WELFARE RECORD
// ======================================================

function editWelfare(id) {

    const record = welfare.find(
        item => String(item.id) === String(id)
    );

    if (!record) {
        alert("Welfare record not found.");
        return;
    }

    // Refresh member selections first.
    updateMemberDropdowns();

    const memberDropdown = document.getElementById("welfareMember");

    memberDropdown.value = String(record.memberId);

    if (memberDropdown.value !== String(record.memberId)) {
        alert("The member attached to this welfare record could not be found.");
        return;
    }

    editingWelfareId = record.id;

    document.getElementById("welfareDate").value = record.date;

    document.getElementById("welfareAmount").value = record.amount;

    document.getElementById("welfareDescription").value =
        record.description || "";

    document.querySelector(
        '#welfareForm button[type="submit"]'
    ).textContent = "Update Welfare";

    document.getElementById("welfareForm").scrollIntoView({
        behavior: "smooth"
    });

}

// ======================================================
// SAVE OR UPDATE WELFARE RECORD
// ======================================================

document.getElementById("welfareForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const memberId = document.getElementById("welfareMember").value;
    const date = document.getElementById("welfareDate").value;
    const amount = Number(document.getElementById("welfareAmount").value);
    const description = document.getElementById("welfareDescription").value.trim();

    if (!members.some(member => member.id === memberId)) {
        alert("Please select a valid member.");
        return;
    }

    if (!date || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid date and amount.");
        return;
    }

    if (editingWelfareId !== null) {

        const record = welfare.find(item => item.id === editingWelfareId);

        if (!record) {
            alert("Welfare record not found.");
            return;
        }

        record.memberId = memberId;
        record.date = date;
        record.amount = amount;
        record.description = description;

        editingWelfareId = null;

        alert("Welfare record updated successfully.");

    } else {

        const record = {
            id: makeID("WEL"),
            memberId: memberId,
            date: date,
            amount: amount,
            description: description
        };

        welfare.push(record);

        alert("Welfare contribution recorded successfully.");

    }

    saveData("teamwork2026Welfare", welfare);

    this.reset();

    const submitButton = document.querySelector("#welfareForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Record Welfare";
    }

    displayWelfare();
    updateDashboard();

});


// ======================================================
// 12. DELETE WELFARE RECORD
// ======================================================

function deleteWelfare(id) {

    if (!confirm("Delete this welfare record?")) return;

    welfare = welfare.filter(function(record) {
        return record.id !== id;
    });

    saveData("teamwork2026Welfare", welfare);

    displayWelfare();
    updateDashboard();

}


// ======================================================
// 13. CANCEL WELFARE EDIT
// ======================================================

function cancelWelfareEdit() {

    editingWelfareId = null;

    document.getElementById("welfareForm").reset();

    const submitButton = document.querySelector("#welfareForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Record Welfare";
    }

}
// ======================================================
// 13. LOAN MANAGEMENT
// ======================================================

let editingLoanId = null;

function displayLoans() {

    const table = document.getElementById("loansTableBody");

    if (!table) return;

    if (loans.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="9">No loans have been issued.</td>
            </tr>
        `;

        updateRepaymentDropdown();
        return;
    }

    table.innerHTML = loans.map(function(loan) {

        const member = members.find(item => item.id === loan.memberId);

        return `
            <tr>

                <td>${escapeHTML(loan.loanNumber)}</td>

                <td>${escapeHTML(member ? member.memberNumber : "Unknown")}</td>

                <td>${formatMoney(loan.principal)}</td>

                <td>${formatMoney(loan.interest)}</td>

                <td>${formatMoney(loan.totalPayable)}</td>

                <td>${formatMoney(loan.amountPaid)}</td>

                <td>${formatMoney(loan.balance)}</td>

                <td>${escapeHTML(loan.status)}</td>

                <td>

                    <button class="view-btn"
                        data-action="view-loan"
                        data-id="${escapeHTML(loan.id)}">
                        View
                    </button>

                    <button class="edit-btn"
                        data-action="edit-loan"
                        data-id="${escapeHTML(loan.id)}"
                        ${loan.amountPaid > 0 ? "disabled title='Loans with repayments cannot be edited'" : ""}>
                        Edit
                    </button>

                    <button class="delete-btn"
                        data-action="delete-loan"
                        data-id="${escapeHTML(loan.id)}">
                        Delete
                    </button>

                </td>

            </tr>
        `;

    }).join("");

    updateRepaymentDropdown();

}


// ======================================================
// EDIT LOAN
// ======================================================

function editLoan(id) {

    const loan = loans.find(item => item.id === id);

    if (!loan) {
        alert("Loan record not found.");
        return;
    }

    if (loan.amountPaid > 0) {
        alert("This loan already has repayments. It cannot be edited.");
        return;
    }

    editingLoanId = id;

    document.getElementById("loanMember").value = loan.memberId;
    document.getElementById("loanDate").value = loan.dateIssued;
    document.getElementById("loanPrincipal").value = loan.principal;

    const submitButton = document.querySelector("#loanForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Update Loan";
    }

    document.getElementById("loanForm").scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================================
// CANCEL LOAN EDIT
// ======================================================

function cancelLoanEdit() {

    editingLoanId = null;

    document.getElementById("loanForm").reset();

    const submitButton = document.querySelector("#loanForm button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Issue Loan";
    }

}

// ======================================================
// 19. DASHBOARD CALCULATIONS
// ======================================================

function updateDashboard() {

    const totalSavings = savings.reduce(function(total, record) {
        return total + Number(record.amount);
    }, 0);

    const totalWelfare = welfare.reduce(function(total, record) {
        return total + Number(record.amount);
    }, 0);

    const activeLoans = loans.filter(function(loan) {
        return loan.balance > 0;
    }).length;

    const outstanding = loans.reduce(function(total, loan) {
        return total + Number(loan.balance);
    }, 0);

    const totalInterest = loans.reduce(function(total, loan) {
        return total + Number(loan.interest);
    }, 0);

    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("totalSavings").textContent =
        formatMoney(totalSavings);

    document.getElementById("totalWelfare").textContent =
        formatMoney(totalWelfare);

    document.getElementById("activeLoans").textContent =
        activeLoans;

    document.getElementById("outstandingLoans").textContent =
        formatMoney(outstanding);

    document.getElementById("totalInterest").textContent =
        formatMoney(totalInterest);

}

// ======================================================
// 20. FINANCIAL REPORTS
// ======================================================

function updateReports() {

    const totalSavings = savings.reduce((total, record) => {
        return total + Number(record.amount);
    }, 0);

    const totalWelfare = welfare.reduce((total, record) => {
        return total + Number(record.amount);
    }, 0);

    const totalLoans = loans.reduce((total, loan) => {
        return total + Number(loan.principal);
    }, 0);

    const outstanding = loans.reduce((total, loan) => {
        return total + Number(loan.balance);
    }, 0);

    const totalInterest = loans.reduce((total, loan) => {
        return total + Number(loan.interest);
    }, 0);

    document.getElementById("reportMembers").textContent =
        members.length;

    document.getElementById("reportSavings").textContent =
        formatMoney(totalSavings);

    document.getElementById("reportWelfare").textContent =
        formatMoney(totalWelfare);

    document.getElementById("reportLoans").textContent =
        formatMoney(totalLoans);

    document.getElementById("reportOutstanding").textContent =
        formatMoney(outstanding);

    document.getElementById("reportInterest").textContent =
        formatMoney(totalInterest);

}


// ======================================================
// 21. PRINT AND DOWNLOAD REPORTS
// ======================================================

function printContent(title, content) {

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups in your browser to print or save this document.");
        return;
    }

    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>${escapeHTML(title)}</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #222;
                }

                h2, h3 {
                    color: #102a56;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    border: 1px solid #ccc;
                    padding: 10px;
                    text-align: left;
                }

                th {
                    background: #eee;
                }

            </style>

        </head>

        <body>

            <h2>2015TEAMWORK SAVINGS GROUP</h2>

            <h3>${escapeHTML(title)}</h3>

            ${content}

            <p style="margin-top:30px;">
                Teamwork & Trust | Transparency & Accountability
            </p>

        </body>

        </html>

    `);

    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.print();
    };

}


document.getElementById("printReportBtn").addEventListener("click", function() {

    updateReports();

    const content = document.getElementById("financialSummary").innerHTML;

    printContent("Group Financial Report", content);

});


// ======================================================
// 22. TABLE ACTIONS
// ======================================================

document.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    switch (action) {

        case "edit-member":
            editMember(id);
            break;

        case "delete-member":
            deleteMember(id);
            break;

        case "delete-saving":
            deleteSaving(id);
            break;

                case "edit-saving":
        editSaving(id);
        break;

        case "delete-welfare":
            deleteWelfare(id);
            break;

            case "edit-welfare":
    editWelfare(id);
    break;

case "edit-loan":
    editLoan(id);
    break;

        case "view-loan":
            viewLoan(id);
            break;

        case "delete-loan":
            deleteLoan(id);
            break;

    }

});


// ======================================================
// 23. INTEREST SHARING
// ======================================================

// The interest pool is saved so it remains available after
// closing and reopening the browser.
let totalInterestPool = Number(
    localStorage.getItem("teamwork2026InterestPool")
) || 0;


// Calculate a member's accumulated savings from all saved records.
function getMemberTotalSavings(memberId) {
    return savings
        .filter(record => String(record.memberId) === String(memberId))
        .reduce((total, record) => total + Number(record.amount || 0), 0);
}


// Display each member's share of the total interest.
function renderInterestSharing() {
    const interestInput = document.getElementById("interestAvailable");
    const tableBody = document.getElementById("interestTableBody");

    if (!interestInput || !tableBody) {
        console.error("Interest Sharing HTML elements were not found.");
        return;
    }

    interestInput.value = totalInterestPool;

    const memberTotals = members.map(member => ({
        member: member,
        totalSavings: getMemberTotalSavings(member.id)
    }));

    const totalGroupSavings = memberTotals.reduce(
        (total, item) => total + item.totalSavings, 0
    );

    const eligibleMembers = memberTotals.filter(
        item => item.totalSavings > 0
    );

    document.getElementById("sharingTotalSavings").textContent =
        formatMoney(totalGroupSavings);

    document.getElementById("sharingTotalInterest").textContent =
        formatMoney(totalInterestPool);

    document.getElementById("sharingMembers").textContent =
        eligibleMembers.length;

    document.getElementById("summarySavings").textContent =
        formatMoney(totalGroupSavings);

    document.getElementById("summaryInterest").textContent =
        formatMoney(totalInterestPool);

    tableBody.innerHTML = "";

    if (totalGroupSavings <= 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">No savings records are available for interest sharing.</td>
            </tr>
        `;

        document.getElementById("summaryDistributed").textContent =
            formatMoney(0);

        return;
    }

    let distributedInterest = 0;
    let eligibleIndex = 0;

    memberTotals.forEach(function(item) {
        const member = item.member;
        const memberTotal = item.totalSavings;

        let percentage = 0;
        let interestShare = 0;

        if (memberTotal > 0) {
            percentage = (memberTotal / totalGroupSavings) * 100;
            eligibleIndex++;

            if (eligibleIndex === eligibleMembers.length) {
                // The last eligible member receives any rounding remainder,
                // ensuring that the distributed total equals the interest pool.
                interestShare = totalInterestPool - distributedInterest;
            } else {
                interestShare = Math.round(
                    (memberTotal / totalGroupSavings) * totalInterestPool
                );

                distributedInterest += interestShare;
            }
        }

        const totalPayable = memberTotal + interestShare;
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(member.memberNumber || "")}</td>
            <td>${escapeHTML(member.name || "")}</td>
            <td>${formatMoney(memberTotal)}</td>
            <td>${percentage.toFixed(2)}%</td>
            <td>${formatMoney(interestShare)}</td>
            <td>${formatMoney(totalPayable)}</td>
        `;

        tableBody.appendChild(row);
    });

    document.getElementById("summaryDistributed").textContent =
        formatMoney(totalInterestPool);
}


// Save the interest amount and calculate the shares.
document.getElementById("calculateInterestBtn").addEventListener(
    "click",
    function() {
        const input = document.getElementById("interestAvailable");
        const amount = Number(input.value);

        if (input.value.trim() === "" || !Number.isFinite(amount) || amount < 0) {
            alert("Please enter a valid interest amount of zero or more.");
            return;
        }

        totalInterestPool = Math.round(amount);

        localStorage.setItem(
            "teamwork2026InterestPool",
            String(totalInterestPool)
        );

        renderInterestSharing();

        alert("Interest shares calculated successfully.");
    }
);


// Print the interest sharing report.
document.getElementById("printInterestBtn").addEventListener(
    "click",
    function() {
        renderInterestSharing();

        const table = document.querySelector("#interestPage table");

        if (!table) {
            alert("The interest sharing table could not be found.");
            return;
        }

        const reportContent = `
            <h3>END-OF-CYCLE INTEREST SHARING</h3>

            <p><strong>Total Group Savings:</strong>
                ${escapeHTML(document.getElementById("summarySavings").textContent)}
            </p>

            <p><strong>Total Interest Available:</strong>
                ${escapeHTML(document.getElementById("summaryInterest").textContent)}
            </p>

            <p><strong>Interest Distributed:</strong>
                ${escapeHTML(document.getElementById("summaryDistributed").textContent)}
            </p>

            ${table.outerHTML}
        `;

        printContent("Interest Sharing Report", reportContent);
    }
);


// ======================================================
// 24. INITIALIZE SYSTEM
// ======================================================

function initializeSystem() {

    // Set default dates.

    document.getElementById("memberDate").value = today();

    document.getElementById("savingsDate").value = today();

    document.getElementById("welfareDate").value = today();

    document.getElementById("loanDate").value = today();

    document.getElementById("repaymentDate").value = today();

    // Load existing records.

    displayMembers();

    displaySavings();

    displayWelfare();

    displayLoans();

    updateMemberDropdowns();

    updateDashboard();

    updateReports();

    // Open dashboard.

    showPage("dashboardPage");

    console.log("2015TEAMWORK Savings Manager loaded successfully.");

}
// ======================================================
// EXPENSES MANAGEMENT
// ======================================================


// 1. RECORD AND UPDATE EXPENSES

document.getElementById("expenseForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const expense = {
        id: editingExpenseId || makeID("EXP"),

        date: document.getElementById("expenseDate").value,

        category: document.getElementById("expenseCategory").value,

        description: document.getElementById("expenseDescription").value,

        amount: Number(document.getElementById("expenseAmount").value),

        receiver: document.getElementById("expenseReceiver").value,

        reference: document.getElementById("expenseReference").value
    };

    if (editingExpenseId) {

        const index = expenses.findIndex(function(item) {
            return item.id === editingExpenseId;
        });

        if (index !== -1) {
            expenses[index] = expense;
        }

        editingExpenseId = null;

        document.querySelector("#expenseForm button[type='submit']").textContent =
            "Record Expense";

    } else {

        expenses.push(expense);

    }

    saveData("teamwork2026Expenses", expenses);

    this.reset();

    displayExpenses();

    updateDashboard();

    alert("Expense saved successfully!");

});


// 2. DISPLAY EXPENSES

function displayExpenses() {

    const table = document.getElementById("expensesTableBody");

    if (!table) return;

    table.innerHTML = "";

    let total = 0;

    expenses.forEach(function(expense) {

        total += Number(expense.amount);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(expense.date)}</td>

            <td>${escapeHTML(expense.category)}</td>

            <td>${escapeHTML(expense.description)}</td>

            <td>${formatMoney(expense.amount)}</td>

            <td>${escapeHTML(expense.receiver || "")}</td>

            <td>${escapeHTML(expense.reference || "")}</td>

            <td>
                <button type="button" data-action="edit" data-id="${escapeHTML(expense.id)}">
                    Edit
                </button>

                <button type="button" data-action="delete" data-id="${escapeHTML(expense.id)}">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);

    });

    document.getElementById("totalExpenses").textContent =
        formatMoney(total);

}


// 3. HANDLE EDIT AND DELETE BUTTONS

document.getElementById("expensesTableBody").addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    const action = button.dataset.action;

    if (action === "edit") {

        editExpense(id);

    }

    if (action === "delete") {

        deleteExpense(id);

    }

});


// 4. EDIT EXPENSE

function editExpense(id) {

    const expense = expenses.find(function(item) {
        return item.id === id;
    });

    if (!expense) {

        alert("Expense record not found!");

        return;
    }

    editingExpenseId = id;

    document.getElementById("expenseDate").value = expense.date;

    document.getElementById("expenseCategory").value = expense.category;

    document.getElementById("expenseDescription").value = expense.description;

    document.getElementById("expenseAmount").value = expense.amount;

    document.getElementById("expenseReceiver").value = expense.receiver || "";

    document.getElementById("expenseReference").value = expense.reference || "";

    document.querySelector("#expenseForm button[type='submit']").textContent =
        "Update Expense";

    document.getElementById("expenseForm").scrollIntoView({
        behavior: "smooth"
    });

}


// 5. DELETE EXPENSE

function deleteExpense(id) {

    const expense = expenses.find(function(item) {
        return item.id === id;
    });

    if (!expense) {

        alert("Expense record not found!");

        return;
    }

    const confirmation = confirm(
        "Are you sure you want to delete this expense?\n\n" +
        expense.description + "\n" +
        formatMoney(expense.amount)
    );

    if (!confirmation) return;

    expenses = expenses.filter(function(item) {
        return item.id !== id;
    });

    saveData("teamwork2026Expenses", expenses);

    displayExpenses();

    updateDashboard();

    alert("Expense deleted successfully!");

}


// END OF EXPENSES MANAGEMENT

// Start the application.

initializeSystem();


// ======================================================
// END OF 2015TEAMWORK SAVINGS MANAGER
// ======================================================