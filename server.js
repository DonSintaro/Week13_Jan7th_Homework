inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "employee_manager"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    runManager();
});

async function runManager(){
    var doAgain = true;

    while (doAgain != false) {
    const data = await inquirer
    .prompt([{
        type: "list",
        name: "option",
        message: "Please define what you would like to do: \n 'Post' an item, 'Bid' on an item, or 'exit'",
        choices: ["View All Employees", "View All Employees By Department", "View All Employees By Manager", "Add Employee", "Update Employee Role", "Add Role", "Add Department"]
    }])

    switch (data.option) {
////////////////////////////////////////////////////
        case "Add Employee":
            const fName = await inquirer
            .prompt([{
                message: "First name of employee?: ",
                name: "first_name"
            }]);
            if (fName.first_name != null){

                const lName = await inquirer
                .prompt([{
                    message: "Last name of employee?: ",
                    name: "last_name"
                }]);
                if (lName.last_name != null){

                    
                    const roleBuffer = await inquirer
                    .prompt([{
                        type: "list",
                        name: "roleSelected",
                        message: "What is the employee role?: ",
                        choices: readRoles()
                    }])

                    let roleID = getRoleID(roleBuffer.roleSelected);

                    const eManagerBuffer = await inquirer
                    .prompt([{
                        type: "list",
                        name: "managerSelected",
                        message: "Who is the employee's manager?: ",
                        choices: readStaff()
                    }])

                    if (eManagerBuffer.managerSelected != "None"){
                    let manageID = getManagerID(eManagerBuffer.managerSelected);
                    createEmployee(fName.first_name,lName.last_name,roleID,manageID)
                    }

                    else{
                    createEmployee(fName.first_name,lName.last_name,roleID)
                    }
                
                }
                else{
                    console.log("You must enter an employee full name! ")
                }
            
            }
            else{
                console.log("You must enter an employee full name! ")
            }

            break;

////////////////////////////////////////////////////
        case "Update Employee Role":

            const value = await inquirer
            .prompt([{
                message: "Value your pushing?: ",
                name: "value"
            }]);
            ///////////////////////////////////////////////////////////////////// Also here /////////////////////////////////////////////////
            

            break;
/////////////////////////////////////////////////////
        case "View All Employees":

            break;



        case "Exit":
            doAgain = false;
            break;
    }}


}


function validateNum(x){
    var parsed = parseInt(x);
    if (isNaN(parsed) || parsed.toString().length != x.length) { 
      return false;
    }
    return true;
}

function createEmployee(f,l,r,m) {
    var query = connection.query(
    "INSERT INTO employee SET ?",
    {
        first_name: f,
        last_name: l,
        role_id: r,
        manager_id: m
    },
    function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " employee added\n");
    }
    );
    // logs the actual query being run
    console.log(query.sql);
}

function createRole(x,y,z) {
    var query = connection.query(
        "INSERT INTO role SET ?",
        {
            title: x,
            salary: y,
            department_id: z
        },
        function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " role created!\n");
        }
    );
}

function createDepartment(x){
    var query = connection.query(
        "INSERT INTO department SET ?",
        {
            name: x
        },
        function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " department created!\n");
        }
    );
    connection.end();
}

function readRoles() {
    let roleList;
    connection.query("SELECT * FROM role", function (err, res) {  
        roleList = res.map(function(iter){
            return iter.title;
        })
    connection.end();
        
    });
    return roleList;
}

function getRoleID(x){
    connection.query("SELECT * FROM role", function (err, res) {  
            return res.filter(function(y){
                if (y.title === x){
                    return y.id;
                }
            })
        })
    connection.end();
}


function readStaff(){
    let manageList;
    connection.query("SELECT * FROM employee", function (err, res) {  
        manageList = res.map(function(iter){
            return (iter.first_name + " " + iter.last_name);
        })
    connection.end();
    manageList.unshift("None");
        
    });
    return manageList;
}

function getManagerID(x){
    connection.query("SELECT * FROM employee", function (err, res) {  
        return res.filter(function(y){
            if ((y.first_name + " " + y.last_name) === x){
                return y.id;
            }
        })
    })
connection.end();
}

//////////////////////////////////////////////  You Are Here  ///////////////////////////////////////  check for dup first + last name, if true, prevent creation
function updateEmployee(x,y){
    connection.query(
        "UPDATE employee SET ? WHERE ?",
        [
            {
            role_id: x
            },
            {
            id: y
            }
        ],
        function(err, res) {
            if (err) throw err;
        })
}


function getEmployeeID(x,y){

}


function checkDupName(x){

}