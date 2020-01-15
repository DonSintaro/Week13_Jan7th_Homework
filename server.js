var inquirer = require("inquirer");
var mysql = require("mysql");
var util = require("util");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "TempServerPassword",
  database: "employee_manager"
});

const query = util.promisify(connection.query).bind(connection);

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    //test("test1");

    runManager();


});



async function runManager(){
    var doAgain = true;

    while (doAgain != false) {
    const data = await inquirer
    .prompt([{
        type: "list",
        name: "option",
        message: "Please define action",
        choices: ["View All Employees", "View All Employees By Department", "View All Employees By Manager", "Add Employee", "Update Employee Role", "Add Role", "Add Department","Exit"]
    }])

    switch (data.option) {
////////////////////////////////////////////////////
        case "Add Employee":
            let fName = await inquirer
            .prompt([{
                message: "First name of employee?: ",
                name: "first_name"
            }]);
            if (fName.first_name != null){

                let lName = await inquirer
                .prompt([{
                    message: "Last name of employee?: ",
                    name: "last_name"
                }]);
                if (lName.last_name != null){
                    let bufferName = (fName.first_name + " " + lName.last_name);
                    if(checkDupName(bufferName) != true){
                        let roleBuffer = await inquirer
                        .prompt([{
                            type: "list",
                            name: "roleSelected",
                            message: "What is the employee role?: ",
                            choices: await readRoles()
                        }])

                        let roleID = await getRoleID(roleBuffer.roleSelected);

                        let eManagerBuffer = await inquirer
                        .prompt([{
                            type: "list",
                            name: "managerSelected",
                            message: "Who is the employee's manager?: ",
                            choices: await readStaffNames()
                        }])

                        if (eManagerBuffer.managerSelected != "None"){
                        let manageID = await getEmployeeID(eManagerBuffer.managerSelected);


                        console.log(fName.first_name,lName.last_name,roleID,manageID);



                        createEmployee(fName.first_name,lName.last_name,roleID,manageID)
                        console.log("-----------------------");
                        }

                        else{
                        createEmployee(fName.first_name,lName.last_name,roleID)
                        console.log("-----------------------");
                        }
                    }
                    else{
                        console.log("Duplicate name found, please use a different/altered name or alias")
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
        case "Add Role":

            let data3 = await inquirer
            .prompt([{
                message: "Role title?: ",
                name: "title"
            }
                , {
                message: "Salary?: ",
                name: "salary"
            }]);

            if (validateNum(data3.salary)){
                if(data3.title)
                {
                    let data4 = await inquirer
                    .prompt([{
                        type: "list",
                        name: "role",
                        message: "Department of role?: ",
                        choices: await readDepartments()
                    }]);

                    let bufferDepotID = await getDepotID(data4.role);

                    createRole(data3.title,data3.salary,bufferDepotID);
                } 
                else{
                    console.log("You must have a title name!")
                }
            }
            else{
                console.log("Invalid salary provided, please try again. ")
            }


            break;

////////////////////////////////////////////////////
        case "Add Department":

            let depotBuffer = await inquirer
            .prompt([{
                name: "department",
                message: "Department Name?: "
            }])
            if (depotBuffer.department){
            createDepartment(depotBuffer.department)
            }
            else{
                console.log("Invalid department name! \n")
            }


            break;
////////////////////////////////////////////////////
        case "View All Employees By Manager":

            // let tempList0 = await query("SELECT * FROM employee inner JOIN employee on employee.manager_id = employee.id");
            // console.log(tempList0);


            break;

////////////////////////////////////////////////////
        case "View All Employees By Department":
            let tempList1 = await query("SELECT * FROM employee RIGHT JOIN role on employee.role_id = role.id");
            
            console.log(tempList1);




            break;
////////////////////////////////////////////////////
        case "Update Employee Role":

            let employeeBuffer = await inquirer
            .prompt([{
                type: "list",
                name: "employee",
                message: "Who's role to change?: ",
                choices: await readStaffNames()
            }])
            let roleBuffer = await inquirer
            .prompt([{
                type: "list",
                name: "role",
                message: "To what role?: ",
                choices: await readRoles()
            }])
        
            let roleID = await getRoleID(roleBuffer.role);
            let manageID = await getEmployeeID(employeeBuffer.employee);
            updateEmployee(roleID,manageID);
            

            break;
/////////////////////////////////////////////////////
        case "View All Employees":
            let tempList2 = await query("SELECT * FROM employee");
            console.log(tempList2);

        break;


/////////////////////////////////////////////////////
        case "Exit":
            connection.end();
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

async function createEmployee(f,l,r,m) {
    await query("INSERT INTO employee SET ?",{first_name: f,last_name: l,role_id: r,manager_id: m})
        console.log(" employee added\n");
}

async function createRole(x,y,z) {
    await query("INSERT INTO role SET ?",{
            title: x,
            salary: y,
            department_id: z
        })
        console.log(" role created!\n");
}

async function createDepartment(x){
    await query("INSERT INTO department SET ?",{
            name: x
        })
        console.log(" department created!\n");
}

async function updateEmployee(x,y){
    await query("UPDATE employee SET ? WHERE ?",
        [
            {
            role_id: x
            },
            {
            id: y
            }
        ])
}

async function readDepartments() {
    let depotList;
    let tempList = await query("SELECT * FROM department");
        depotList = tempList.map(function(iter){
            return iter.name;  
    });
    return depotList;
}

async function readRoles() {
    let roleList;
    let tempList = await query("SELECT * FROM role");
    roleList = tempList.map(function(iter){
        return iter.title;
    });
    return roleList;
}

async function getDepotID(x){
    let tempList = await query("SELECT * FROM department"); 
    let tempObj =  tempList.find(function(y){
                if (y.name === x){
                    return y.id;
                }
            })

            return tempObj.id
}

async function getRoleID(x){
    let tempList = await query("SELECT * FROM role");
            let tempObj =  tempList.find(function(y){
                return (y.title === x)
        })

        return tempObj.id;
}
async function readStaffNames(){
    let manageList;
    let tempList = await query("SELECT * FROM employee");
        manageList = tempList.map(function(iter){
            return (iter.first_name + " " + iter.last_name);
        });
    manageList.unshift("None");
        
    
    return manageList;
}

async function getEmployeeID(x){
    let tempList = await query("SELECT * FROM employee");
    let tempObj =  tempList.find(function(y){
            if ((y.first_name + " " + y.last_name) === x){
                return y.id;
            }
        })

        return tempObj.id;
}

async function checkDupName(x){
    let tempList = await query("SELECT * FROM employee");  
    tempList.forEach(function(y){
            if ((y.first_name + " " + y.last_name) === x){
                return true;
            }
    })
return false;
}
