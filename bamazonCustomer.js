var mysql = require("mysql");
var inquirer = require("inquirer");

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
    displayProducts();
});

function displayProducts() {
    console.log("Here are all the products available\n")
    // select from the products table 
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // loop through the results and display each item in the table
        // the results from this query is an array 
        res.forEach(function (item) {
            console.log(`${item.item_id}||${item.product_name}||${item.department_name}||${item.price}||${item.stock_quantity}`
            )
        });
        order();

    });

};

function order() {
    inquirer.prompt([
        {
            name: "productID",
            message: "What is the ID of the product you want to buy",
            type: "input",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "units",
            message: "How many units would you like to buy",
            type: "input",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (answer) {
    // query selects columns in theproducts table based on a specific item number
        var query = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE item_id =? ";
    //    based on the above query use the answer from the inquirer question above (productID)

        connection.query(query, [answer.productID], function (err, res) {
            if (err) throw err;

    // if the stock quantity is 0 - there will only be one result which is why the index is 0
    // looking for the exact match based on the unique item ID 
            if (res[0].stock_quantity === 0) {
                console.log("Sorry we are out of stock")
            }
    // if the unit requested is less than or equal to the amount we have in stocl 
            else if (answer.units <=res[0].stock_quantity) {
                console.log(`we have enough, there are ${res[0].stock_quantity} units left|| your request -  ${answer.units}`)
    // place order by passing in some parameters requred 
                placeOrder(res[0].stock_quantity, answer.units, answer.productID, res[0].price)

            }
            else {
                console.log(`Sorry we can't fulfil your order, there is only ${res[0].stock_quantity} units left`)
                changeOrder();
            }

        });

    })
};

function placeOrder(currentAmount, amountOrdered, id, price) {
    var query = "UPDATE products SET ? WHERE ?"
    var remainingUnit = currentAmount - amountOrdered
    var totalPrice = amountOrdered * price

    connection.query(query,
        [
        // what we are setting -setting the stock quantity to the remaining unit calc above
            { stock_quantity: remainingUnit },
    // where the item id is the passed in ID in the function 
            { item_id: id }
        ],
        function (err, res) {
            if (err) throw err;
            // fix price to be fixed to 2 decimal places 
            console.log(`Total comes up to $${totalPrice}, you should receive it soon!`)
           
            // console.log(res.affectedRows + " products updated \n");
            // console.log(`${JSON.stringify(res)}    entire res `)
  
     })
};

function changeOrder() {
    inquirer.prompt([
        {
            name: "changeOrder",
            message: "Would you like to change your order?",
            type: "confirm"
        }
    ]).then(function(answer){
        if (answer.changeOrder){
            order();
        }
        else{
            console.log("Run node again if you change your mind!");
            connection.end();
        }
       
    })

}




//   var query = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE ?";
//   connection.query(query, {item_id:answer.productID}, function(err, res){
//      if (err) throw err;
//       console.log(res)
//   })