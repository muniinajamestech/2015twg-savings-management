// ======================================================
// 2015TEAMWORK SAVINGS MANAGER
// COMPLETE CORRECTED JAVASCRIPT SYSTEM
// ======================================================


// ======================================================
// 1. SUPABASE CONNECTION
// ======================================================

// The Supabase URL is available.
// The actual public/anon key must be obtained from
// Supabase Project Settings > API Keys.
//
// Do not put the REST URL in place of the API key.
// Do not use the service_role or secret key in browser code.
//
// Supabase connection will be enabled after the correct
// public key is supplied.

const SUPABASE_URL =
    "https://vqmfizderbqmhwmbxwre.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_FwxUSagmS9ct_jhXAApm9A_Nocs6jXC";

let teamworkSupabase = null;

if (
    SUPABASE_ANON_KEY &&
    window.supabase &&
    typeof window.supabase.createClient === "function"
) {
    teamworkSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    console.log("Supabase client initialized.");
} else {
    console.warn(
        "Supabase is not connected yet. Using browser storage."
    );
}


// ======================================================
// 2. DATA STORAGE
// ======================================================

function loadData(key) {

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || [];

    } catch (error) {

        console.error("Error loading data:", error);

        return [];

    }

}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error("Error saving data:", error);

        alert("Unable to save your data. Check browser storage.");

    }

}


let members = loadData("teamwork2026Members");

let savings = loadData("teamwork2026Savings");

let welfare = loadData("teamwork2026Welfare");

let loans = loadData("teamwork2026Loans");

let expenses = loadData("teamwork2026Expenses");


let editingExpenseId = null;

let editingSavingsId = null;

let editingWelfareId = null;

let editingLoanId = null;


// ======================================================
// 3. GENERAL FUNCTIONS
// ======================================================

function formatMoney(amount) {

    return "UGX " +
        Number(amount || 0).toLocaleString("en-US");

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

    return prefix +
        Date.now() +
        Math.floor(Math.random() * 1000);

}


function getElement(id) {

    return document.getElementById(id);

}


function setText(id, value) {

    const element = getElement(id);

    if (element) {

        element.textContent = value;

    }

}


function getMember(memberId) {

    return members.find(function(member) {

        return String(member.id) === String(memberId);

    });

}


// ======================================================
// 4. PAGE NAVIGATION
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

    const selectedPage = getElement(pageID);

    if (!selectedPage) {

        console.error("Page not found:", pageID);

        return;

    }

    document.querySelectorAll(".page").forEach(function(page) {

        page.classList.remove("active");

    });


    selectedPage.classList.add("active");


    document.querySelectorAll(".nav-btn").forEach(function(button) {

        button.classList.toggle(
            "active",
            button.dataset.page === pageID
        );

    });


    setText(
        "pageTitle",
        pageNames[pageID] || "2015TEAMWORK"
    );


    switch (pageID) {

        case "dashboardPage":

            updateDashboard();

            break;


        case "membersPage":

            displayMembers();

            break;


        case "savingsPage":

            displaySavings();

            break;


        case "welfarePage":

            displayWelfare();

            break;


        case "loansPage":

            displayLoans();

            break;


        case "expensesPage":

            displayExpenses();

            break;


        case "reportsPage":

            updateReports();

            break;


        case "interestPage":

            renderInterestSharing();

            break;

    }

}


// Navigation event listener

document.querySelectorAll(".nav-btn").forEach(function(button) {

    button.addEventListener("click", function() {

        showPage(button.dataset.page);

    });

});


// ======================================================
// 5. CURRENT DATE
// ======================================================

setText(
    "currentDate",
    new Date().toLocaleDateString("en-UG", {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    })
);


// ======================================================
// 6. MEMBER NUMBER GENERATION
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

    return "TW2015" +
        String(highestNumber + 1).padStart(3, "0");

}


// ======================================================
// 7. MEMBERS MANAGEMENT
// ======================================================

function displayMembers(searchTerm = "") {

    const table = getElement("membersTableBody");

    if (!table) return;

    const search = searchTerm.toLowerCase();

    const filteredMembers = members.filter(function(member) {

        return (

            String(member.name || "")
                .toLowerCase()
                .includes(search)

            ||

            String(member.memberNumber || "")
                .toLowerCase()
                .includes(search)

            ||

            String(member.phone || "")
                .toLowerCase()
                .includes(search)

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

                    <button
                        class="edit-btn"
                        data-action="edit-member"
                        data-id="${escapeHTML(member.id)}">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        data-action="delete-member"
                        data-id="${escapeHTML(member.id)}">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    }).join("");

}


// ======================================================
// REGISTER MEMBER - SUPABASE
// ======================================================

getElement("memberForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const name = getElement("memberName").value.trim();

        const phone = getElement("memberPhone").value.trim();

        const dateJoined = getElement("memberDate").value;


        if (!name || !phone || !dateJoined) {

            alert("Please complete all member details.");

            return;

        }


        const memberNumber = generateMemberNumber();


        // SAVE MEMBER TO SUPABASE

        const { data, error } = await teamworkSupabase

            .from("members")

            .insert([{

                "Full_name": name,

                "Phone": phone,

                "Member_number": memberNumber,

                "Status": "Active"

            }])

            .select()

            .single();


        // CHECK FOR ERRORS

        if (error) {

            console.error("Member registration error:", error);

            alert("Member registration failed: " + error.message);

            return;

        }


        // UPDATE LOCAL MEMBER LIST

        const member = {

            id: data.id,

            memberNumber: data.Member_number,

            name: data.Full_name,

            phone: data.Phone,

            dateJoined: dateJoined

        };


        members.push(member);

        saveData("teamwork2026Members", members);


        this.reset();

        getElement("memberDate").value = today();


        displayMembers();

        updateMemberDropdowns();

        updateDashboard();

        updateReports();


        alert(
            "Member registered successfully!\nMember Number: " +
            member.memberNumber
        );

    }
);


// Search members

getElement("memberSearch").addEventListener(
    "input",
    function() {

        displayMembers(this.value);

    }
);


// ======================================================
// 8. EDIT AND DELETE MEMBERS
// ======================================================

function editMember(id) {

    const member = getMember(id);

    if (!member) return;


    const newName = prompt(
        "Enter member's full name:",
        member.name
    );

    if (newName === null) return;


    const newPhone = prompt(
        "Enter member's phone number:",
        member.phone
    );

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

    renderInterestSharing();

    updateDashboard();

    updateReports();


    alert("Member details updated successfully.");

}


function deleteMember(id) {

    const hasTransactions =

        savings.some(item => String(item.memberId) === String(id))

        ||

        welfare.some(item => String(item.memberId) === String(id))

        ||

        loans.some(item => String(item.memberId) === String(id));


    if (hasTransactions) {

        alert(
            "This member has financial records. " +
            "You cannot delete the member until those records have been handled."
        );

        return;

    }


    if (!confirm("Are you sure you want to delete this member?")) {

        return;

    }


    members = members.filter(function(member) {

        return String(member.id) !== String(id);

    });


    saveData("teamwork2026Members", members);


    displayMembers();

    updateMemberDropdowns();

    updateDashboard();

    updateReports();

    renderInterestSharing();


    alert("Member deleted successfully.");

}


// ======================================================
// 9. MEMBER DROPDOWNS
// ======================================================

function updateMemberDropdowns() {

    const dropdownIDs = [

        "savingsMember",

        "statementMember",

        "welfareMember",

        "loanMember"

    ];


    dropdownIDs.forEach(function(dropdownID) {

        const dropdown = getElement(dropdownID);

        if (!dropdown) return;


        const previousValue = dropdown.value;


        dropdown.innerHTML = `

            <option value="">Select Member</option>

        `;


        members.forEach(function(member) {

            const option = document.createElement("option");

            option.value = String(member.id);

            option.textContent =
                member.memberNumber + " - " + member.name;

            dropdown.appendChild(option);

        });


        if (
            members.some(function(member) {

                return String(member.id) === String(previousValue);

            })
        ) {

            dropdown.value = previousValue;

        }

    });

}


// ======================================================
// 10. SAVINGS MANAGEMENT
// ======================================================

function displaySavings() {

    const table = getElement("savingsTableBody");

    if (!table) return;


    if (savings.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    No savings records available.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = savings.map(function(record) {

        const member = getMember(record.memberId);


        return `

            <tr>

                <td>
                    ${escapeHTML(member ? member.memberNumber : "Unknown")}
                </td>

                <td>
                    ${escapeHTML(member ? member.name : "Unknown")}
                </td>

                <td>
                    ${escapeHTML(record.date)}
                </td>

                <td>
                    ${formatMoney(record.amount)}
                </td>

                <td>
                    ${escapeHTML(record.description || "-")}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        data-action="edit-saving"
                        data-id="${escapeHTML(record.id)}">

                        Edit

                    </button>


                    <button
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


// Edit savings

function editSaving(id) {

    const record = savings.find(function(item) {

        return String(item.id) === String(id);

    });

    if (!record) {

        alert("Savings record not found.");

        return;

    }


    updateMemberDropdowns();

    getElement("savingsMember").value = record.memberId;


    editingSavingsId = record.id;


    getElement("savingsDate").value = record.date;

    getElement("savingsAmount").value = record.amount;

    getElement("savingsDescription").value =
        record.description || "";


    getElement(
        "savingsForm"
    ).querySelector("button[type='submit']").textContent =
        "Update Savings";


    getElement("savingsForm").scrollIntoView({

        behavior: "smooth"

    });

}


// Cancel savings editing

function cancelSavingsEdit() {

    editingSavingsId = null;

    getElement("savingsForm").reset();

    getElement("savingsDate").value = today();

    getElement(
        "savingsForm"
    ).querySelector("button[type='submit']").textContent =
        "Record Savings";

}


// Save savings

getElement("savingsForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const memberId = getElement("savingsMember").value;

        const date = getElement("savingsDate").value;

        const amount = Number(
            getElement("savingsAmount").value
        );

        const description =
            getElement("savingsDescription").value.trim();


        if (!getMember(memberId)) {

            alert("Please select a valid member.");

            return;

        }


        if (!date || !Number.isFinite(amount) || amount <= 0) {

            alert("Please enter a valid date and amount.");

            return;

        }


        if (editingSavingsId !== null) {

            const record = savings.find(function(item) {

                return String(item.id) === String(editingSavingsId);

            });

            if (!record) {

                alert("Savings record not found.");

                return;

            }


            record.memberId = memberId;

            record.date = date;

            record.amount = amount;

            record.description = description;


            saveData("teamwork2026Savings", savings);

            cancelSavingsEdit();


            alert("Savings record updated successfully.");

        } else {

            savings.push({

                id: makeID("SAV"),

                memberId: memberId,

                date: date,

                amount: amount,

                description: description

            });


            saveData("teamwork2026Savings", savings);


            this.reset();

            getElement("savingsDate").value = today();


            alert("Savings recorded successfully.");

        }


        displaySavings();

        updateDashboard();

        updateReports();

        renderInterestSharing();

    }
);


// Delete savings

function deleteSaving(id) {

    if (!confirm("Are you sure you want to delete this savings record?")) {

        return;

    }


    savings = savings.filter(function(record) {

        return String(record.id) !== String(id);

    });


    saveData("teamwork2026Savings", savings);


    displaySavings();

    updateDashboard();

    updateReports();

    renderInterestSharing();


    alert("Savings record deleted successfully.");

}


// ======================================================
// 11. INDIVIDUAL SAVINGS STATEMENT
// ======================================================

function viewMemberSavingsStatement() {

    const memberId = getElement("statementMember").value;

    const output = getElement("memberSavingsStatement");

    const member = getMember(memberId);


    if (!member) {

        alert("Please select a member.");

        return;

    }


    const records = savings.filter(function(record) {

        return String(record.memberId) === String(memberId);

    });


    const total = records.reduce(function(sum, record) {

        return sum + Number(record.amount || 0);

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

        <p>
            <strong>Member Number:</strong>
            ${escapeHTML(member.memberNumber)}
        </p>

        <p>
            <strong>Member Name:</strong>
            ${escapeHTML(member.name)}
        </p>

        <p>
            <strong>Phone:</strong>
            ${escapeHTML(member.phone)}
        </p>

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

                ${rows || `
                    <tr>
                        <td colspan="3">No savings recorded.</td>
                    </tr>
                `}

            </tbody>

        </table>

        <h3>Total Savings: ${formatMoney(total)}</h3>

    `;

}


getElement("viewStatementBtn").addEventListener(
    "click",
    viewMemberSavingsStatement
);


getElement("downloadStatementBtn").addEventListener(
    "click",
    function() {

        const statement = getElement("memberSavingsStatement");

        if (!statement.innerHTML.trim()) {

            alert("Please view a member statement first.");

            return;

        }


        printContent(
            "Member Savings Statement",
            statement.innerHTML
        );

    }
);


// ======================================================
// 12. WELFARE MANAGEMENT
// ======================================================

function displayWelfare() {

    const table = getElement("welfareTableBody");

    if (!table) return;


    if (welfare.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    No welfare records available.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = welfare.map(function(record) {

        const member = getMember(record.memberId);


        return `

            <tr>

                <td>
                    ${escapeHTML(member ? member.memberNumber : "Unknown")}
                </td>

                <td>
                    ${escapeHTML(member ? member.name : "Unknown")}
                </td>

                <td>
                    ${escapeHTML(record.date)}
                </td>

                <td>
                    ${formatMoney(record.amount)}
                </td>

                <td>
                    ${escapeHTML(record.description || "-")}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        data-action="edit-welfare"
                        data-id="${escapeHTML(record.id)}">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        data-action="delete-welfare"
                        data-id="${escapeHTML(record.id)}">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    }).join("");

}


// Edit welfare

function editWelfare(id) {

    const record = welfare.find(function(item) {

        return String(item.id) === String(id);

    });

    if (!record) {

        alert("Welfare record not found.");

        return;

    }


    updateMemberDropdowns();

    getElement("welfareMember").value = record.memberId;


    editingWelfareId = record.id;


    getElement("welfareDate").value = record.date;

    getElement("welfareAmount").value = record.amount;

    getElement("welfareDescription").value =
        record.description || "";


    getElement(
        "welfareForm"
    ).querySelector("button[type='submit']").textContent =
        "Update Welfare";


    getElement("welfareForm").scrollIntoView({

        behavior: "smooth"

    });

}


// Cancel welfare editing

function cancelWelfareEdit() {

    editingWelfareId = null;

    getElement("welfareForm").reset();

    getElement("welfareDate").value = today();

    getElement(
        "welfareForm"
    ).querySelector("button[type='submit']").textContent =
        "Record Welfare";

}


// Save welfare

getElement("welfareForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const memberId = getElement("welfareMember").value;

        const date = getElement("welfareDate").value;

        const amount = Number(
            getElement("welfareAmount").value
        );

        const description =
            getElement("welfareDescription").value.trim();


        if (!getMember(memberId)) {

            alert("Please select a valid member.");

            return;

        }


        if (!date || !Number.isFinite(amount) || amount <= 0) {

            alert("Please enter a valid date and amount.");

            return;

        }


        if (editingWelfareId !== null) {

            const record = welfare.find(function(item) {

                return String(item.id) === String(editingWelfareId);

            });

            if (!record) {

                alert("Welfare record not found.");

                return;

            }


            record.memberId = memberId;

            record.date = date;

            record.amount = amount;

            record.description = description;


            alert("Welfare record updated successfully.");

        } else {

            welfare.push({

                id: makeID("WEL"),

                memberId: memberId,

                date: date,

                amount: amount,

                description: description

            });


            alert("Welfare contribution recorded successfully.");

        }


        saveData("teamwork2026Welfare", welfare);


        this.reset();

        getElement("welfareDate").value = today();


        editingWelfareId = null;


        getElement(
            "welfareForm"
        ).querySelector("button[type='submit']").textContent =
            "Record Welfare";


        displayWelfare();

        updateDashboard();

        updateReports();

    }
);


// Delete welfare

function deleteWelfare(id) {

    if (!confirm("Delete this welfare record?")) {

        return;

    }


    welfare = welfare.filter(function(record) {

        return String(record.id) !== String(id);

    });


    saveData("teamwork2026Welfare", welfare);


    displayWelfare();

    updateDashboard();

    updateReports();


    alert("Welfare record deleted successfully.");

}


// ======================================================
// 13. LOAN MANAGEMENT
// ======================================================

function calculateLoan(principal) {

    const interest = Math.round(principal * 0.10);

    const totalPayable = principal + interest;

    return {

        interest: interest,

        totalPayable: totalPayable

    };

}


// Generate loan number

function generateLoanNumber() {

    return "TWLOAN" + Date.now();

}


// Display loans

function displayLoans() {

    const table = getElement("loansTableBody");

    if (!table) return;


    if (loans.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="9">
                    No loans have been issued.
                </td>

            </tr>

        `;

        updateRepaymentDropdown();

        return;

    }


    table.innerHTML = loans.map(function(loan) {

        const member = getMember(loan.memberId);


        // Support records created before repayment tracking.

        const principal = Number(loan.principal || 0);

        const interest = Number(
            loan.interest ?? calculateLoan(principal).interest
        );

        const totalPayable = Number(
            loan.totalPayable ?? principal + interest
        );

        const amountPaid = Number(loan.amountPaid || 0);

        const balance = Number(
            loan.balance ?? totalPayable - amountPaid
        );


        loan.interest = interest;

        loan.totalPayable = totalPayable;

        loan.amountPaid = amountPaid;

        loan.balance = Math.max(0, balance);

        loan.status = loan.balance <= 0 ? "Completed" : "Active";


        return `

            <tr>

                <td>${escapeHTML(loan.loanNumber || "-")}</td>

                <td>
                    ${escapeHTML(member ? member.memberNumber : "Unknown")}
                </td>

                <td>${formatMoney(principal)}</td>

                <td>${formatMoney(interest)}</td>

                <td>${formatMoney(totalPayable)}</td>

                <td>${formatMoney(amountPaid)}</td>

                <td>${formatMoney(loan.balance)}</td>

                <td>${escapeHTML(loan.status)}</td>

                <td>

                    <button
                        class="view-btn"
                        data-action="view-loan"
                        data-id="${escapeHTML(loan.id)}">

                        View

                    </button>


                    <button
                        class="edit-btn"
                        data-action="edit-loan"
                        data-id="${escapeHTML(loan.id)}"
                        ${amountPaid > 0 ? "disabled" : ""}>

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        data-action="delete-loan"
                        data-id="${escapeHTML(loan.id)}">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    }).join("");


    saveData("teamwork2026Loans", loans);

    updateRepaymentDropdown();

}


// Issue or update loan

getElement("loanForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const memberId = getElement("loanMember").value;

        const dateIssued = getElement("loanDate").value;

        const principal = Number(
            getElement("loanPrincipal").value
        );


        if (!getMember(memberId)) {

            alert("Please select a valid member.");

            return;

        }


        if (!dateIssued || !Number.isFinite(principal) || principal <= 0) {

            alert("Enter a valid loan date and amount.");

            return;

        }


        const calculation = calculateLoan(principal);


        if (editingLoanId !== null) {

            const loan = loans.find(function(item) {

                return String(item.id) === String(editingLoanId);

            });

            if (!loan) {

                alert("Loan record not found.");

                return;

            }


            if (Number(loan.amountPaid || 0) > 0) {

                alert("A loan with repayments cannot be edited.");

                return;

            }


            loan.memberId = memberId;

            loan.dateIssued = dateIssued;

            loan.principal = principal;

            loan.interest = calculation.interest;

            loan.totalPayable = calculation.totalPayable;

            loan.amountPaid = 0;

            loan.balance = calculation.totalPayable;

            loan.status = "Active";


            alert("Loan updated successfully.");

        } else {

            loans.push({

                id: makeID("LOAN"),

                loanNumber: generateLoanNumber(),

                memberId: memberId,

                dateIssued: dateIssued,

                principal: principal,

                interest: calculation.interest,

                totalPayable: calculation.totalPayable,

                amountPaid: 0,

                balance: calculation.totalPayable,

                repayments: [],

                status: "Active"

            });


            alert("Loan issued successfully.");

        }


        saveData("teamwork2026Loans", loans);


        editingLoanId = null;

        this.reset();

        getElement("loanDate").value = today();

        this.querySelector("button[type='submit']").textContent =
            "Issue Loan";


        displayLoans();

        updateDashboard();

        updateReports();

    }
);


// Edit loan

function editLoan(id) {

    const loan = loans.find(function(item) {

        return String(item.id) === String(id);

    });

    if (!loan) {

        alert("Loan record not found.");

        return;

    }


    if (Number(loan.amountPaid || 0) > 0) {

        alert("This loan already has repayments. It cannot be edited.");

        return;

    }


    editingLoanId = loan.id;


    getElement("loanMember").value = loan.memberId;

    getElement("loanDate").value = loan.dateIssued;

    getElement("loanPrincipal").value = loan.principal;


    getElement(
        "loanForm"
    ).querySelector("button[type='submit']").textContent =
        "Update Loan";


    getElement("loanForm").scrollIntoView({

        behavior: "smooth"

    });

}


// Cancel loan editing

function cancelLoanEdit() {

    editingLoanId = null;

    getElement("loanForm").reset();

    getElement("loanDate").value = today();

    getElement(
        "loanForm"
    ).querySelector("button[type='submit']").textContent =
        "Issue Loan";

}


// View loan

function viewLoan(id) {

    const loan = loans.find(function(item) {

        return String(item.id) === String(id);

    });

    if (!loan) {

        alert("Loan record not found.");

        return;

    }


    const member = getMember(loan.memberId);

    const repayments = loan.repayments || [];


    let repaymentDetails = repayments.map(function(repayment) {

        return (
            repayment.date + " — " +
            formatMoney(repayment.amount)
        );

    }).join("\n");


    alert(

        "LOAN DETAILS\n\n" +

        "Loan Number: " + loan.loanNumber + "\n" +

        "Member: " + (member ? member.name : "Unknown") + "\n" +

        "Loan Date: " + loan.dateIssued + "\n" +

        "Principal: " + formatMoney(loan.principal) + "\n" +

        "Interest: " + formatMoney(loan.interest) + "\n" +

        "Total Payable: " + formatMoney(loan.totalPayable) + "\n" +

        "Amount Paid: " + formatMoney(loan.amountPaid) + "\n" +

        "Balance: " + formatMoney(loan.balance) + "\n\n" +

        "REPAYMENTS\n" +

        (repaymentDetails || "No repayments recorded.")

    );

}


// Delete loan

function deleteLoan(id) {

    const loan = loans.find(function(item) {

        return String(item.id) === String(id);

    });

    if (!loan) {

        alert("Loan record not found.");

        return;

    }


    if (Number(loan.amountPaid || 0) > 0) {

        alert(
            "This loan already has repayments. " +
            "It cannot be deleted because doing so would remove financial history."
        );

        return;

    }


    if (!confirm("Are you sure you want to delete this loan?")) {

        return;

    }


    loans = loans.filter(function(item) {

        return String(item.id) !== String(id);

    });


    saveData("teamwork2026Loans", loans);


    displayLoans();

    updateDashboard();

    updateReports();


    alert("Loan deleted successfully.");

}


// ======================================================
// 14. LOAN REPAYMENTS
// ======================================================

function updateRepaymentDropdown() {

    const dropdown = getElement("repaymentLoan");

    if (!dropdown) return;


    const previousValue = dropdown.value;


    dropdown.innerHTML = `

        <option value="">Select Loan</option>

    `;


    loans.forEach(function(loan) {

        const balance = Number(
            loan.balance ??
            Number(loan.totalPayable || 0) -
            Number(loan.amountPaid || 0)
        );


        if (balance <= 0) return;


        const member = getMember(loan.memberId);


        const option = document.createElement("option");

        option.value = String(loan.id);

        option.textContent =

            (loan.loanNumber || "Loan") +

            " - " +

            (member ? member.name : "Unknown") +

            " - Balance: " +

            formatMoney(balance);


        dropdown.appendChild(option);

    });


    dropdown.value = previousValue;

}


getElement("repaymentForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const loanId = getElement("repaymentLoan").value;

        const date = getElement("repaymentDate").value;

        const amount = Number(
            getElement("repaymentAmount").value
        );


        const loan = loans.find(function(item) {

            return String(item.id) === String(loanId);

        });


        if (!loan) {

            alert("Please select a valid loan.");

            return;

        }


        if (!date || !Number.isFinite(amount) || amount <= 0) {

            alert("Enter a valid repayment date and amount.");

            return;

        }


        const balance = Number(
            loan.balance ??
            Number(loan.totalPayable || 0) -
            Number(loan.amountPaid || 0)
        );


        if (amount > balance) {

            alert(
                "The repayment cannot exceed the outstanding balance of " +
                formatMoney(balance)
            );

            return;

        }


        loan.repayments = loan.repayments || [];


        loan.repayments.push({

            id: makeID("REP"),

            date: date,

            amount: amount

        });


        loan.amountPaid = Number(loan.amountPaid || 0) + amount;

        loan.balance = Math.max(
            0,
            Number(loan.totalPayable) - loan.amountPaid
        );

        loan.status = loan.balance <= 0 ? "Completed" : "Active";


        saveData("teamwork2026Loans", loans);


        this.reset();

        getElement("repaymentDate").value = today();


        displayLoans();

        updateDashboard();

        updateReports();


        alert("Loan repayment recorded successfully.");

    }
);


// ======================================================
// 15. DASHBOARD CALCULATIONS
// ======================================================

function updateDashboard() {

    const totalSavings = savings.reduce(function(total, record) {

        return total + Number(record.amount || 0);

    }, 0);


    const totalWelfare = welfare.reduce(function(total, record) {

        return total + Number(record.amount || 0);

    }, 0);


    const activeLoans = loans.filter(function(loan) {

        return Number(loan.balance || 0) > 0;

    }).length;


    const outstanding = loans.reduce(function(total, loan) {

        return total + Number(loan.balance || 0);

    }, 0);


    const totalInterest = loans.reduce(function(total, loan) {

        return total + Number(loan.interest || 0);

    }, 0);


    setText("totalMembers", members.length);

    setText("totalSavings", formatMoney(totalSavings));

    setText("totalWelfare", formatMoney(totalWelfare));

    setText("activeLoans", activeLoans);

    setText("outstandingLoans", formatMoney(outstanding));

    setText("totalInterest", formatMoney(totalInterest));

}


// ======================================================
// 16. FINANCIAL REPORTS
// ======================================================

function updateReports() {

    const totalSavings = savings.reduce(function(total, record) {

        return total + Number(record.amount || 0);

    }, 0);


    const totalWelfare = welfare.reduce(function(total, record) {

        return total + Number(record.amount || 0);

    }, 0);


    const totalLoans = loans.reduce(function(total, loan) {

        return total + Number(loan.principal || 0);

    }, 0);


    const outstanding = loans.reduce(function(total, loan) {

        return total + Number(loan.balance || 0);

    }, 0);


    const totalInterest = loans.reduce(function(total, loan) {

        return total + Number(loan.interest || 0);

    }, 0);


    setText("reportMembers", members.length);

    setText("reportSavings", formatMoney(totalSavings));

    setText("reportWelfare", formatMoney(totalWelfare));

    setText("reportLoans", formatMoney(totalLoans));

    setText("reportOutstanding", formatMoney(outstanding));

    setText("reportInterest", formatMoney(totalInterest));

}


// ======================================================
// 17. PRINTING AND DOWNLOADING
// ======================================================

function printContent(title, content) {

    const printWindow = window.open("", "_blank");


    if (!printWindow) {

        alert(
            "Please allow pop-ups in your browser to print or save this document."
        );

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

                Teamwork & Trust |
                Transparency & Accountability

            </p>

        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.onload = function() {

        printWindow.print();

    };

}


// Print financial report

getElement("printReportBtn").addEventListener(
    "click",
    function() {

        updateReports();

        const content =
            getElement("financialSummary").innerHTML;


        printContent(
            "Group Financial Report",
            content
        );

    }
);


// ======================================================
// 18. EXPENSES MANAGEMENT
// ======================================================

function displayExpenses() {

    const table = getElement("expensesTableBody");

    if (!table) return;


    table.innerHTML = "";


    let total = 0;


    if (expenses.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7">
                    No expenses recorded.
                </td>

            </tr>

        `;

    }


    expenses.forEach(function(expense) {

        total += Number(expense.amount || 0);


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(expense.date)}</td>

            <td>${escapeHTML(expense.category)}</td>

            <td>${escapeHTML(expense.description)}</td>

            <td>${formatMoney(expense.amount)}</td>

            <td>${escapeHTML(expense.receiver || "")}</td>

            <td>${escapeHTML(expense.reference || "")}</td>

            <td>

                <button
                    type="button"
                    data-action="edit-expense"
                    data-id="${escapeHTML(expense.id)}">

                    Edit

                </button>


                <button
                    type="button"
                    data-action="delete-expense"
                    data-id="${escapeHTML(expense.id)}">

                    Delete

                </button>

            </td>

        `;


        table.appendChild(row);

    });


    setText("totalExpenses", formatMoney(total));

}


// Record or update expense

getElement("expenseForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const date = getElement("expenseDate").value;

        const category = getElement("expenseCategory").value;

        const description =
            getElement("expenseDescription").value.trim();

        const amount = Number(
            getElement("expenseAmount").value
        );

        const receiver =
            getElement("expenseReceiver").value.trim();

        const reference =
            getElement("expenseReference").value.trim();


        if (!date || !category || !description ||
            !Number.isFinite(amount) || amount <= 0) {

            alert("Please complete all required expense details.");

            return;

        }


        const expense = {

            id: editingExpenseId || makeID("EXP"),

            date: date,

            category: category,

            description: description,

            amount: amount,

            receiver: receiver,

            reference: reference

        };


        if (editingExpenseId) {

            const index = expenses.findIndex(function(item) {

                return String(item.id) === String(editingExpenseId);

            });


            if (index !== -1) {

                expenses[index] = expense;

            }


            editingExpenseId = null;


            alert("Expense updated successfully.");

        } else {

            expenses.push(expense);

            alert("Expense recorded successfully.");

        }


        saveData("teamwork2026Expenses", expenses);


        this.reset();

        getElement("expenseDate").value = today();

        this.querySelector("button[type='submit']").textContent =
            "Record Expense";


        displayExpenses();

    }
);


// Edit expense

function editExpense(id) {

    const expense = expenses.find(function(item) {

        return String(item.id) === String(id);

    });


    if (!expense) {

        alert("Expense record not found.");

        return;

    }


    editingExpenseId = expense.id;


    getElement("expenseDate").value = expense.date;

    getElement("expenseCategory").value = expense.category;

    getElement("expenseDescription").value =
        expense.description;

    getElement("expenseAmount").value = expense.amount;

    getElement("expenseReceiver").value =
        expense.receiver || "";

    getElement("expenseReference").value =
        expense.reference || "";


    getElement(
        "expenseForm"
    ).querySelector("button[type='submit']").textContent =
        "Update Expense";


    getElement("expenseForm").scrollIntoView({

        behavior: "smooth"

    });

}


// Delete expense

function deleteExpense(id) {

    const expense = expenses.find(function(item) {

        return String(item.id) === String(id);

    });


    if (!expense) {

        alert("Expense record not found.");

        return;

    }


    if (!confirm(

        "Are you sure you want to delete this expense?\n\n" +

        expense.description + "\n" +

        formatMoney(expense.amount)

    )) {

        return;

    }


    expenses = expenses.filter(function(item) {

        return String(item.id) !== String(id);

    });


    saveData("teamwork2026Expenses", expenses);


    displayExpenses();


    alert("Expense deleted successfully.");

}


// ======================================================
// 19. INTEREST SHARING
// ======================================================

let totalInterestPool = Number(

    localStorage.getItem("teamwork2026InterestPool")

) || 0;


function getMemberTotalSavings(memberId) {

    return savings

        .filter(function(record) {

            return String(record.memberId) === String(memberId);

        })

        .reduce(function(total, record) {

            return total + Number(record.amount || 0);

        }, 0);

}


function renderInterestSharing() {

    const interestInput = getElement("interestAvailable");

    const tableBody = getElement("interestTableBody");


    if (!interestInput || !tableBody) return;


    interestInput.value = totalInterestPool;


    const memberTotals = members.map(function(member) {

        return {

            member: member,

            totalSavings: getMemberTotalSavings(member.id)

        };

    });


    const totalGroupSavings = memberTotals.reduce(

        function(total, item) {

            return total + item.totalSavings;

        },

        0

    );


    const eligibleMembers = memberTotals.filter(function(item) {

        return item.totalSavings > 0;

    });


    setText(
        "sharingTotalSavings",
        formatMoney(totalGroupSavings)
    );

    setText(
        "sharingTotalInterest",
        formatMoney(totalInterestPool)
    );

    setText(
        "sharingMembers",
        eligibleMembers.length
    );

    setText(
        "summarySavings",
        formatMoney(totalGroupSavings)
    );

    setText(
        "summaryInterest",
        formatMoney(totalInterestPool)
    );


    tableBody.innerHTML = "";


    if (totalGroupSavings <= 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="6">

                    No savings records are available for interest sharing.

                </td>

            </tr>

        `;


        setText(
            "summaryDistributed",
            formatMoney(0)
        );

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

            percentage =
                (memberTotal / totalGroupSavings) * 100;


            eligibleIndex++;


            if (eligibleIndex === eligibleMembers.length) {

                interestShare =
                    totalInterestPool - distributedInterest;

            } else {

                interestShare = Math.round(

                    (memberTotal / totalGroupSavings) *
                    totalInterestPool

                );


                distributedInterest += interestShare;

            }

        }


        const totalPayable =
            memberTotal + interestShare;


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


    setText(
        "summaryDistributed",
        formatMoney(totalInterestPool)
    );

}


// Calculate interest shares

getElement("calculateInterestBtn").addEventListener(
    "click",
    function() {

        const input = getElement("interestAvailable");

        const amount = Number(input.value);


        if (
            input.value.trim() === "" ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            alert("Please enter a valid interest amount.");

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


// Print interest sharing report

getElement("printInterestBtn").addEventListener(
    "click",
    function() {

        renderInterestSharing();


        const table = getElement("interestPage")
            .querySelector("table");


        if (!table) {

            alert("Interest sharing table could not be found.");

            return;

        }


        const reportContent = `

            <h3>END-OF-CYCLE INTEREST SHARING</h3>

            <p>

                <strong>Total Group Savings:</strong>

                ${escapeHTML(
                    getElement("summarySavings").textContent
                )}

            </p>


            <p>

                <strong>Total Interest Available:</strong>

                ${escapeHTML(
                    getElement("summaryInterest").textContent
                )}

            </p>


            <p>

                <strong>Interest Distributed:</strong>

                ${escapeHTML(
                    getElement("summaryDistributed").textContent
                )}

            </p>


            ${table.outerHTML}

        `;


        printContent(
            "Interest Sharing Report",
            reportContent
        );

    }
);


// ======================================================
// 20. TABLE ACTIONS
// ======================================================

document.addEventListener("click", function(event) {

    const button = event.target.closest(
        "button[data-action]"
    );


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


        case "edit-saving":

            editSaving(id);

            break;


        case "delete-saving":

            deleteSaving(id);

            break;


        case "edit-welfare":

            editWelfare(id);

            break;


        case "delete-welfare":

            deleteWelfare(id);

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


        case "edit-expense":

            editExpense(id);

            break;


        case "delete-expense":

            deleteExpense(id);

            break;

    }

});


// ======================================================
// 21. INITIALIZE SYSTEM
// ======================================================

function initializeSystem() {

    // Set default dates.

    getElement("memberDate").value = today();

    getElement("savingsDate").value = today();

    getElement("welfareDate").value = today();

    getElement("loanDate").value = today();

    getElement("repaymentDate").value = today();

    getElement("expenseDate").value = today();


    // Load existing records.

    updateMemberDropdowns();

    displayMembers();

    displaySavings();

    displayWelfare();

    displayLoans();

    displayExpenses();


    // Update financial figures.

    updateDashboard();

    updateReports();

    renderInterestSharing();


    // Open dashboard.

    showPage("dashboardPage");


    console.log(
        "2015TEAMWORK Savings Manager loaded successfully."
    );

}


// ======================================================
// START APPLICATION
// ======================================================

initializeSystem();

// ======================================================
//  AUTHENTICATION - 2015TEAMWORK
// ======================================================

const authScreen = document.getElementById("authScreen");
const appContainer = document.getElementById("appContainer");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

// Show the login screen
function showLoginScreen() {
    authScreen.style.display = "flex";
    appContainer.style.display = "none";
}

// Show the application after successful login
function showApplication() {
    authScreen.style.display = "none";
    appContainer.style.display = "";
}

// Check whether Supabase is connected
if (teamworkSupabase) {

    // Check existing login session
    teamworkSupabase.auth.getSession().then(({ data, error }) => {

        if (error) {
            console.error("Session error:", error.message);
            showLoginScreen();
            return;
        }

        if (data.session) {
            showApplication();
        } else {
            showLoginScreen();
        }

    });

    // Listen for login and logout events
    
    teamworkSupabase.auth.onAuthStateChange((event, session) => {

    if (event === "PASSWORD_RECOVERY") {

        authScreen.style.display = "none";
        appContainer.style.display = "none";
        document.getElementById("resetScreen").style.display = "flex";

        return;
    }

    if (session) {
        showApplication();
    } else {
        showLoginScreen();
    }

});

} else {

    showLoginScreen();

    loginMessage.textContent =
        "Supabase connection is unavailable.";

}

// Handle login form
loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    loginMessage.textContent = "Signing in...";

    const { data, error } =
        await teamworkSupabase.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        loginMessage.textContent = error.message;
        loginMessage.style.color = "red";

        return;
    }

    loginMessage.textContent = "Login successful!";
    loginMessage.style.color = "green";

    showApplication();

});

// Handle forgotten password
forgotPasswordBtn.addEventListener("click", async function() {

    const email = document.getElementById("loginEmail").value.trim();

    if (!email) {
        loginMessage.textContent =
            "Please enter your email address first.";
        loginMessage.style.color = "red";
        return;
    }

    const { error } =
        await teamworkSupabase.auth.resetPasswordForEmail(email, {
            redirectTo:redirectTo: "https://muniinajamestech.github.io/2015twg-savings-management/"
        });

    if (error) {

        loginMessage.textContent = error.message;
        loginMessage.style.color = "red";

    } else {

        loginMessage.textContent =
            "Password reset instructions have been sent to your email.";

        loginMessage.style.color = "green";

    }

});

// ======================================================
// PASSWORD RESET FUNCTION
// ======================================================

const resetPasswordForm = document.getElementById("resetPasswordForm");

resetPasswordForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const resetMessage = document.getElementById("resetMessage");

    if (newPassword !== confirmPassword) {
        resetMessage.textContent = "Passwords do not match.";
        resetMessage.style.color = "red";
        return;
    }

    resetMessage.textContent = "Updating password...";

    const { error } = await teamworkSupabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        resetMessage.textContent = error.message;
        resetMessage.style.color = "red";
        return;
    }

    resetMessage.textContent = "Password updated successfully!";
    resetMessage.style.color = "green";

    setTimeout(function() {
        document.getElementById("resetScreen").style.display = "none";
        showApplication();
    }, 2000);

});

// ======================================================
// LOGOUT FUNCTION
// ======================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function() {

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmLogout) {
            return;
        }

        const { error } = await teamworkSupabase.auth.signOut();

        if (error) {
            alert("Logout failed: " + error.message);
        } else {
            alert("You have successfully logged out.");
        }

    });

}

// ======================================================
// END OF 2015TEAMWORK SAVINGS MANAGER
// ======================================================
