//const fetch = require('cross-fetch');
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
var mysql = require('mysql');

console.log("Started the Script>>>>>>>>>>>>>>>>>>")

// getting data from server mysql
var conn = mysql.createConnection({
    host: "sc-prod-database.mysql.database.azure.com",
    user: "bksfipnb",
    password: " ",
    database: "smartcosmos"
});

conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});



async function getProductHashMap(connection, tenantId) {
    var productMap = new Map();
    return new Promise(function (resolve, reject) {
        connection.query(
            `select upc,name from products where tenantId='${tenantId}'`,
            function (err, rows) {
                if (err) throw err;
                if (rows.length == 0) {
                    console.log(`Product not found for tenant : ${tenantId}`);
                } else {
                    for (const data of rows) {
                        productMap.set(data.upc, data.name);
                    }
                }
                resolve(productMap);
            }
        )
    }
    )
}

async function getProcessHashMap(connection, tenantId) {
    let processMap = new Map();
    return new Promise(function (resolve, reject) {
        connection.query(
            `select id,name from processes where tenantId='${tenantId}'`,
            function (err, rows) {
                if (rows.length == 0) {
                    console.log(`Process not found for tenant : ${tenantId}`);
                } else {
                    for (const data of rows) {
                        processMap.set(data.id, data.name);
                    }
                }
                resolve(processMap);
            }

        )
    }
    )
}

//var mongoDb = mongoose.createConnection("mongodb://solution-dev-qamongo:HbylJkfMu8lwRwlAHOWqID9SY256BEnBO9Ulj0awumaJ6VETOOr6cAXu2Od6WQjg5QwOQEzI7ZerACDbyvkF0w==@solution-dev-qamongo.mongo.cosmos.azure.com:10255/smartcosmos_qa?ssl=true&retrywrites=false", { useNewUrlParser: true, useUnifiedTopology: true });

var mongoDb = mongoose.createConnection('mongodb://sc-production-solution-cosmosdb:Ez36mJ2V6phUbj9kgSyJPQ0ycQuSbLx0wmVUMQZNqRVNbUlywQHPP01qEKEdNQddWHsxPXxiDirpACDbBFp3YA==@sc-production-solution-cosmosdb.mongo.cosmos.azure.com:10255/smartcosmos?ssl=true&replicaSet=globaldb&retrywrites=false');

let enablementsData = {}
let enablementByProcesses = {}
let enablementByProducts = {}

function createdAtDateFormat(date) {
    var newDate=date.slice(0, 19).replace('T', ' ');
    let date2=newDate.split('"');
    return date2[1];
}

function getYYMMDDdate(tempDate) {
    let datte = tempDate.split('T');
    let date2=datte[0].split('"');
    let date = date2[1];
    //console.log("getYYMMDDdate of temDate : ", tempDate, " is ", date)
    return date;
}

function getMonth(tempDate) {
    const mm = tempDate.split("-");
    let month = parseInt(mm[1]);
    return month;
}
async function prepairEnablementsData(datas) {
    for (const data of datas) {
        let date = getYYMMDDdate(JSON.stringify(data.operationTime));
        let month = getMonth(date);
        let createdAtDate = createdAtDateFormat(JSON.stringify(data.operationTime));

        if (data.tenantId === null || data.siteId === null || data.processId === null || data.status === null || data.productUPC === null) {
            console.log("Null Value Condition in prepairEnablementsData ", data.tenantId, data.siteId, data.processId, data.status, data.productUPC)
            continue;
        }
        let arrayIndex = `${data.tenantId}-${data.siteId}-${date}`
        // insert into array if not exist    
        if (enablementsData[arrayIndex] === undefined) {
            enablementsData[arrayIndex] =
            {
                tenantId: data.tenantId,
                siteId: data.siteId,
                status: data.status,
                type: 'unsecure',
                beforeStatus: '',
                month: month,
                date: date,
                count: 0,
                createdAt: createdAtDate,
                deEnabledCount:0,
                id:data._id
            }

        }
        if(data.status === 'enabled') enablementsData[arrayIndex].count++
        else {
            enablementsData[arrayIndex].deEnabledCount++
            console.log("denabled data:",data._id)
        }
    }
    console.log("enablementsData length ",enablementsData.length);
    //return enablementsData;
}

async function prepairEnablementByProcessData(datas, processHashMap) {
    for (const data of datas) {
        let date = getYYMMDDdate(JSON.stringify(data.operationTime));
        let month = getMonth(date);
        let createdAtDate = createdAtDateFormat(JSON.stringify(data.operationTime));
        if (data.tenantId === null || data.siteId === null || data.processId === null || data.status === null || data.productUPC === null) {
            console.log("Null Value Condition in prepairEnablementByProcessData ", data.tenantId, data.siteId, data.processId, data.status, data.productUPC)
            continue;
        }
        let processName = processHashMap.get(data.processId);
        if (processName === undefined) {
            console.log("Process not found for :", data.processId)
            continue;
        }
        let arrayIndex = `${data.tenantId}-${data.processId}-${data.siteId}-${date}`
        if (enablementByProcesses[arrayIndex] === undefined) {

            // let processData=await getProcessName(data.tenantId, data.processId)
            enablementByProcesses[arrayIndex] =
            {
                tenantId: data.tenantId,
                siteId: data.siteId,
                processId: data.processId,
                processName: processName,
                status: data.status,
                type: 'unsecure',
                beforeStatus: '',
                month: month,
                date: date,
                count: 0,
                createdAt: createdAtDate
            }

        }

        if(data.status === 'enabled') enablementByProcesses[arrayIndex].count++

    }
   console.log("enablementByProcesses length ",enablementByProcesses.length);

}



async function prepairEnablementByProductData(datas, productHashMap) {
    for (const data of datas) {
        let date = getYYMMDDdate(JSON.stringify(data.operationTime));
        let month = getMonth(date);
        let createdAtDate = createdAtDateFormat(JSON.stringify(data.operationTime));
        if (data.tenantId === null || data.siteId === null || data.processId === null || data.status === null || data.productUPC === null) {
            console.log("Null Value Condition in prepairEnablementByProductData ", data.tenantId, data.siteId, data.processId, data.status, data.productUPC)
            continue;
        }
        let productName = productHashMap.get(data.productUPC);
        if (productName === undefined) {
            console.log("Produc not found for :", data.productId)
            continue;
        }

        let arrayIndex = `${data.tenantId}-${data.processId}-${data.siteId}-${date}`
        if (enablementByProducts[arrayIndex] === undefined) {
            enablementByProducts[arrayIndex] =
            {
                tenantId: data.tenantId,
                siteId: data.siteId,
                status: data.status,
                upc: data.productUPC,
                productName: productName,
                type: 'unsecure',
                beforeStatus: '',
                month: month,
                date: date,
                count: 1,
                createdAt: createdAtDate
            }
        }
        if(data.status === 'enabled') enablementByProducts[arrayIndex].count++

        // adding data to existing index
    }
    //  return enablementByProducts;
    console.log("enablementByProducts length ",enablementByProducts.length);

}

mongoDb.once('open', async function () {
    //let tenantIdArray =['ddfbeaf9-40d0-4980-9ef1-a9c72ab44493','cff6c706-9b45-45ff-ba81-614b470bdb38','b6996074-9aa8-41d7-8a50-32c5f71c6409','8a12fdbf-bc44-4722-9695-f390a305d09d']
    let tenantIdArray = ['c2107b22-b02e-45a7-b126-89b65b054ef6',
    '80a2b0ea-2915-42d1-9f7d-6cc88d6fa269',
    '8dd5c1c6-def0-42b5-a450-3630d763fe92',
    '213ec29c-de8d-465f-8e1f-61d65246726c',
    'f9452900-f90a-40d5-b2a0-a89577774ea2']
    for (const tenantId of tenantIdArray) {

        let limit = 200
        let count = 0
        let productHashMap = await getProductHashMap(conn, tenantId);
        let processHashMap = await getProcessHashMap(conn, tenantId);
        while (true) {
            console.log("New Count", count)
            let tenantData = await mongoDb.collection('digitizedtags').find({ "tenantId": tenantId  }).sort({ operationTime: 1 }).skip(count).limit(limit).toArray();
            if (tenantData.length === 0) {
                await insertIntoMysqlDB(conn,enablementsData, enablementByProcesses, enablementByProducts);
                enablementsData = []
                enablementByProcesses = []
                enablementByProducts = []
                break;
            }
            console.log("Tenant Data length", tenantData.length)

            await prepairEnablementsData(tenantData);
            await prepairEnablementByProcessData(tenantData, processHashMap);
            await prepairEnablementByProductData(tenantData, productHashMap);
            console.log("Update Data Array For Enablements => ", Object.keys(enablementsData).length)
            console.log("Update Data Array For enablementByProcesses => ", Object.keys(enablementByProcesses).length)
            console.log("Update Data Array For enablementByProducts => ", Object.keys(enablementByProducts).length)

            count = count + tenantData.length
            await delay(1000);
        }

    }// closing tenant array
})



async function insertIntoMysqlDB(connection,enablementsData, enablementByProcesses, enablementByProducts) {


    console.log("enablements==>",Object.keys(enablementsData).length,"enablementByProcesses=>",Object.keys(enablementByProcesses).length,"enablementByProducts=>",Object.keys(enablementByProducts).length)
    // insert into enablements 
    //creating  2000 record chunks and bulk insert into database
    let insertLimit = 200;
    let i = 1;
    let sql = 'insert into enablements values ';
    let insertCounter=0;
    console.log("Enablements to be inserted :",Object.keys(enablementsData).length)
    for (const index in enablementsData) {
        let data=enablementsData[index];
        
        let localTeamData=`'`+uuidv4()+`',`+`'`+data.tenantId+`',`+`'`+data.siteId+`',`+`0`+`,`+`0`+`,`+`'`+data.date+`',`+`'`+data.month+`',`+`'`+data.createdAt+`',`+ `'`+data.createdAt+`',`+`null`+`,`+data.count+`,` +data.deEnabledCount;   
        if (i < insertLimit && insertCounter<Object.keys(enablementsData).length-1){
            sql += `(`+ localTeamData+` ), `
            i++;
            insertCounter++;
            continue;
        }
        sql += `(`+ localTeamData +`)`;
        i++;
        insertCounter++;
        connection.query(sql, function (err, result) {
            if (err) {
                console.log("Error in query ", err, sql)

            }
            else
            {
                console.log("Enablements Successfully Inserted :",i, "Total Inserted : ", insertCounter)
            }
        })
        await delay(1000);
        sql = 'insert into enablements values ';
        i = 1;
        
    }


    // insert into enablementByProcess

     i = 1;
     sql= 'insert into enablementByProcesses values ';
    insertCounter=0;
    console.log("enablementByProcesses to be inserted :",Object.keys(enablementByProcesses).length)
    for (const index in enablementByProcesses) {
        let data=enablementByProcesses[index];
        let localTeamData=`'`+uuidv4()+`',`+`'`+data.tenantId+`',`+`'`+data.siteId+`',`+`'`+data.processId+`',`+`'`+data.processName+`',`+`'`+data.count+`',`+`'`+data.date+`',`+`'`+data.month+`',`+`'`+data.createdAt+`',`+ `'`+data.createdAt+`',`+`null`   
       
        if (i < insertLimit && insertCounter<Object.keys(enablementByProcesses).length-1){
            sql += `( ${localTeamData} ), `
            i++;
            insertCounter++;
            continue;
        }
        sql += `( ${localTeamData} )`;
        i++;
        insertCounter++;
        connection.query(sql, function (err, result) {
            if (err) {
                console.log("Error in query ", err, sql)

            }
            else
            {
                console.log("Enablement By Processes Successfully Inserted :",i, "Total Inserted : ", insertCounter)
            }
        })
        await delay(1000);
         sql = 'insert into enablementByProcesses values ';
        i = 1;

    }
    // insert into enablementByProducts       
    i = 1;
    insertCounter=0;
    sql = 'insert into enablementByProducts values ';
    console.log("enablement By Products to be inserted :",Object.keys(enablementByProducts).length)
    for (const index in enablementByProducts) {
        let data=enablementByProducts[index];
        let localTeamData=`'`+uuidv4()+`',`+`'`+data.tenantId+`',`+`'`+data.siteId+`',`+`'`+data.upc+`',`+`'`+data.productName+`',`+`'`+data.count+`',`+`'`+data.date+`',`+`'`+data.month+`',`+`'`+data.createdAt+`',`+ `'`+data.createdAt+`',`+`null`   
       
        if (i < insertLimit && insertCounter<Object.keys(enablementByProducts).length-1){
            sql += `( ${localTeamData} ), `
            i++;
            insertCounter++;
            continue;
        }
        sql += `( ${localTeamData} )`;
        i++;
        insertCounter++;
        connection.query(sql, function (err, result) {
            if (err) {
                console.log("Error in query ", err, sql)

            }
            else
            {
                console.log("Enablement By Products Successfully Inserted :",i, "Total Inserted : ", insertCounter)
            }
        })
        await delay(1000);
        sql= 'insert into enablementByProducts values ';
        i = 1;

    }
}


const delay = (delayInms) => {
    console.log("DELAY>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    return new Promise(resolve => setTimeout(resolve, delayInms));

}
