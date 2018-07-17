var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) {
        throw err;
    }
    readProducts();
});

// display inventory
function readProducts() {
    // Selects all of the data from the table and displays in a list
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + ". " + res[i].productName + " $" + res[i].price);
        }
        // then prompt customer for choice
        purchaseProduct(res);
    });
}
// prompt customer for product id
function purchaseProduct(inventory) {
    inquirer.prompt({
        type: "input",
        name: "choice",
        message: "Enter ID of product you would like to purchase. [Quit with Q]",
        validate: function (val) {
            return !isNaN(val) || val.toLowerCase() === "q";
        }
    }).then(function (val) {
        checkIfExit(val.choice);
        var choiceId = parseInt(val.choice);
        var product = checkInventory(choiceId, inventory);
        if (product) {
            quantity(product);
        }
        else {
            console.log("\nItem not in inventory.");
            loadProducts();
        }

    });
}
// ask for how many they want to purchase
function quantity(product) {
    inquirer.prompt([{
        type: "input",
        name: "quantity",
        message: "How many would you like to purchase? [Quit with Q]",
        validate: function (val) {
            return val > 0 || val.toLowerCase() === "q";
        }
    }]).then(function (val) {
        checkIfExit(val.quantity);
        var quantity = parseInt(val.quantity);
        if (quantity > product.stockQuantity) {
            console.log("\nInsufficiant quantity.");
            readProducts();
        }
        else {
            makePurchase(product, quantity);
        }
    });
}

// Purchase desired quantity of desired item
function makePurchase(product, quantity) {
    connection.query("UPDATE products SET stockQuantity = stockQuantity - ? WHERE id = ?", [quantity, product.id],
        function (err, res) {
            console.log("\nSuccessful purchase of " + quantity + " " + product.productName + "'s");
            readProducts();
        });
}
// Check to see if the product the user chose exists in the inventory
function checkInventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].id === choiceId) {
            // If a matching product is found, return the product
            return inventory[i];
        }
    }
    return null;
}

function checkIfExit(choice) {
    if (choice.toLowerCase() === "q") {
        // Log a message and exit the current node process
        console.log("Goodbye!");
        process.exit(0);
    }
}


