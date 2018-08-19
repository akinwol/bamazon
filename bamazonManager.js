var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    // displayProducts();
});

initialLoad();

function initialLoad() {
    inquirer.prompt([
        {
            name: "initialOption",
            message: "What would you like to do?",
            type: "list",
            choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (answer) {
        switch (answer.initialOption) {
            case "View Products For Sale":
                displayProducts();
                break;
            case "View Low Inventory":
                lowInv();
                break;
            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                addNew();
                break;

            default:
                break;
        }

    });
};




function displayProducts() {
    console.log("Here are all the products available\n")
    // select from the products table 
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // loop through the results and display each item in the table
        // the results from this query is an array 
       console.table(res)
        // res.forEach(function (item) {
        //     console.log(`${item.item_id}||${item.product_name}||${item.price}||${item.stock_quantity}`);

        // });
        initialLoad();

    });
    
};

function lowInv() {
    var query = "SELECT * FROM products WHERE stock_quantity <=5";
    connection.query(query, function (err, res) {
        if (err) throw err;
        // console.log(res)
        console.table(res)
        // res.forEach(function (item) {
        //     console.log(`${item.item_id}||${item.product_name}||${item.price}||${item.stock_quantity}`)
        //     // connection.end();
        // });
        initialLoad();

    });

};

function addInventory() {
    // initialise an array of selection 
    var productSelection = [];
    // select from the entire products table
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;


        // for each item in the results array puch each product name to 
        // the product selction array 

        res.forEach(function (item) {
            // console.log(item.product_name)
            productSelection.push(item.product_name)
        });
        // console.log(productSelection)

        // run inquirer, set the choices to be the product selection array

        inquirer.prompt([
            {
                name: "updateItem",
                message: "Select which item you would like to update",
                type: "list",
                choices: productSelection
            },

            {
                name: "units",
                message: "How many units do you want to add?",
                type: "input",
                validation: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            var query = "UPDATE products SET stock_quantity = stock_quantity+? WHERE ?"

            connection.query(query,
                [
                    answer.units,

                    {
                        product_name: answer.updateItem
                    }
                ],
                function (err, res) {
                    if (err) throw err;

                    console.log(`Amount of rows affected: ${res.affectedRows} `)

                }
            );
            initialLoad();
        });
    });

};

function addNew() {
    inquirer.prompt([
        {
            name: "itemID",
            message: "What is the item ID?",
            type: "input",
            validation: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }

        },
        {
            name: "productName",
            message: "What is the product name?",
            type: "input"
        },
        {
            name: "departmentName",
            message: "Which department does this product belong to?",
            type: "input"
        },
        {
            name: "productPrice",
            message: "How much is the product?",
            type: "input",
            validation: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "productQuantity",
            message: "how many units do you want to add?",
            type: "input"
        }
    ]).then(function (answer) {
        // console.log(answer)
        connection.query(
            "INSERT INTO products SET ?",
            {
                item_id: answer.itemID,
                product_name: answer.productName,
                department_name: answer.departmentName,
                price: answer.productPrice,
                stock_quantity: answer.productQuantity
            },
            function (err, res) {
                if (err) throw err;
                console.log(`Amount of rows affected: ${res.affectedRows} `)
            }
        );
        initialLoad();

    });

};
