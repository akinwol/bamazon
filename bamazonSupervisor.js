
var mysql = require("mysql");
var inquirer = require("inquirer");
var products = []
var totalSales = 0
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
    supurvisor();


});


function supurvisor() {
    inquirer.prompt([
        {
            name: "action",
            message: "What would you like to do?",
            type: "list",
            choices: ["View product sales by department", "Create new department"]
        }
    ]).then(function(answer){
        switch (answer.action) {
            case "View product sales by department":
                viewProductSales();
                break;
            
            case "Create new department":
                addNewDepartment();
                break;
        
            default:
                break;
        }
       
    })

}

function viewProductSales(){
// COALESCE allows you to replace NULL values with 0
connection.query(`SELECT departments.*, COALESCE(SUM(product_sales),0) AS 'Total Sales',
COALESCE(SUM(product_sales),0) - departments.over_head_costs AS 'Total Profit'
FROM departments 
 LEFT JOIN products ON departments.department_name = products.department_name
 GROUP BY departments.department_id`,
    function (err, res) {
        console.log("PRODUCT SALES BY DEPARTMENT")
        if (err) throw err;

        console.table(res)

        supurvisor();
    });
};

function addNewDepartment() {
    inquirer.prompt([
        {
            name: "departmentName",
            message: "What is the department name?",
            type: "input"
        },
        {
            name: "departmentCost",
            message: "What are the overhead cost?",
            type: "input",
            validation: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (answer) {
        // console.log(answer)
        connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: answer.departmentName,
                over_head_costs: answer.departmentCost,
            },
            function (err, res) {
                if (err) throw err;
                console.log(`Amount of rows affected: ${res.affectedRows} `)
            }
           
        );
        supurvisor();
       

    });

};


// connection.query(`SELECT d.department_id, d.department_name, d.overhead_costs,COALESCE(SUM(p.product_sales), 0) AS product_sales,
// COALESCE(SUM(p.product_sales), 0) - overhead_costs AS total_profit
// FROM departments AS d
// LEFT JOIN products AS p
// ON d.department_id = p.department_id
// GROUP BY d.department_id
// ORDER BY d.department_name;`,
//     function (err, res) {
//         console.log("All department")
//         if (err) throw err;

//         console.table(res)


//     });


// SELECT COUNT(department_name) AS 'Total Products', SUM(product_sales) AS 'Total Sales', department_name FROM products GROUP BY department_name "


// connection.query("SELECT products.*, departments.department_id FROM products LEFT JOIN departments ON departments.department_name=products.department_name",
//     function (err, res) {
//         console.log("All department")
//         if (err) throw err;

//         console.table(res)


//     });


// connection.query(
//     "SELECT COUNT(department_name) AS 'Total Products', SUM(product_sales) AS 'Total Sales', department_name FROM products GROUP BY department_name ",
//     function (err, res) {
//         console.log("List of Departments")
//         if (err) throw err;

//         console.table(res)


//     });

