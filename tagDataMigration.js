const mongoose = require("mongoose");
var uuid = require('uuid')

console.log("Started the Script>>>>>>>>>>>>>>>>>>")

// old prod string url
const uri = 'mongodb://diUser:6A200sj9ZlHjuXZHtIo2@sc-prod-new-di-database.cluster-ckpzwf1jxpvt.eu-west-1.docdb.amazonaws.com:27017/digital-identity?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false'
mongoose.createConnection(uri, { tlsCAFile: `rds-combined-ca-bundle.pem` });
var oldDB = mongoose.connection
oldDB.on('error', console.error.bind(console, 'connection error:'));


// new prod string url
var qaDB = mongoose.createConnection('mongodb://solution-dev-qamongo:HbylJkfMu8lwRwlAHOWqID9SY256BEnBO9Ulj0awumaJ6VETOOr6cAXu2Od6WQjg5QwOQEzI7ZerACDbyvkF0w==@solution-dev-qamongo.mongo.cosmos.azure.com:10255/smartcosmos_qa?ssl=true&retryWrites=true');
qaDB.on('error', console.error.bind(console, 'connection error:'));
// qaDB('open', async function () {
//     qaDB.db.listCollections().toArray(function (err, collections) {
//         console.log(collections);
//     });
// })


oldDB.once('open', async function () {
    console.log("Connection Successful!");
    // oldDB.db.listCollections().toArray(function (err, collections) {
    //     console.log(collections);
    // });

    // manufacture data object
    let dataObj = {
        userId: "",
        userName: "",
        manufacturerName: "",
        customerName: "",
        fileName: "",
        batchId: "",
        tagId: "",
        tagInfo: "",
        tagType: "",    //dount
        tagClass: "",
        hash: "",
        secureKey: "",   //doubt
        inlayItemName: "",
        inlayType: "",
        vendorName: "",
        orderId: "",
        orderDate: "",
        orderQuantity: "",
        orderQuantityUnit: "",
        deliveryDate: "",
        deliveryItemName: "",
        deliveryQuantity: "",
        deliveryQuantityUnit: "",
        historyReferenceId: "",
        status: 'Inactive',
        isActivated: false,
        operationTime: new Date(),
        lastValidCounter: '000000'
    };

    // batch data object
    let batchDataObj = {
        "historyReferenceId": "",
        "tenantId": "",
        "tenantName": "",
        "userId": "",
        "userName": "",
        "batchId": "",
        "uploadCount": "",
        "errorCount": "",
        "fileName": "",
        "fileLink": "",
        "errorReportLink": "",
        "status": "",
        "operationTime": new Date(),
    }
    let distinctBatchId = await oldDB.collection("CustomerBatch").distinct("batchId")
    console.log("DistinctBatchId======================>", distinctBatchId)
    for (let batch of distinctBatchId) {
        let tagsData = await oldDB.collection("Tag").find({bId:batch.batchId}).toArray();
        for (let tag of tagsData) {
            try {
                console.log("Tag collection ===> tag Id: ", tag._id);
                dataObj.tagId = tag._id;
                dataObj.batchId = tag.bId;
                dataObj.secureKey = tag.seq;   // doubt
                dataObj.tagType = tag.ttl;    // doubt
                batchDataObj.batchId = tag.bId;
                data.historyReferenceId = uuid.v4();
                batchDataObj.historyReferenceId = uuid.v4();


                let customerBatchData = await oldDB.collection("CustomerBatch").findOne({ 'batchId': tag.bId });

                data.orderId = customerBatchData.orderId;
                data.orderDate = customerBatchData.orderDate;
                data.orderQuantity = customerBatchData.orderQuantity;
                data.orderQuantityUnit = customerBatchData.orderQuantityUnit;
                data.deliveryDate = customerBatchData.deliveryDate;
                data.deliveryItemName = customerBatchData.deliveryItemName;
                data.deliveryQuantity = customerBatchData.deliveryQuantity;
                data.deliveryQuantityUnit = customerBatchData.deliveryQuantityUnit;
                data.inlayItemName = customerBatchData.batchProperties.inlayItemName;
                data.inlayType = customerBatchData.batchProperties.inlayType;


                let customerData = await oldDB.collection("Customer").findOne({ 'customerId': customerBatchData.customerId });
                data.customerName = customerData.customerName;
                data.manufacturerName = customerData.customerName;


                // new production mongo
                let prodManufacturerTagsRes = await qaDB.collection("manufacturerTags").findOne({ 'diId': { $eq: tag._id } });

                if (prodManufacturerTagsRes) {
                    dataObj.status = 'Inactive';
                    dataObj.isActivated = false;

                    let respIn = await qaDB.collection("duplicateManufactureTags").insertOne(dataObj);

                    console.log("Tag exist in manufacturer tags =====> duplicateManufactureTags==================>  ");

                    continue;
                }

                let prodDigitizedTagsRes = await qaDB.collection("digitizedTag").findOne({ 'diId': { $eq: tag._id } });

                if (prodDigitizedTagsRes) {
                    dataObj.tenantId = prodDigitizedTagsRes.tenantId;
                    dataObj.tenantName = prodDigitizedTagsRes.tenantName;
                    batchDataObj.tenantId = prodDigitizedTagsRes.tenantId;
                    batchDataObj.tenantName = prodDigitizedTagsRes.tenantName;
                    batchDataObj.status = 'Active';
                    dataObj.status = 'active';
                    dataObj.isActivated = true;


                    await qaDB.collection("manufacturerTags").insertOne(dataObj);

                    await qaDB.collection("batch").insertOne(batchDataObj);


                    console.log("Tag exist in digitized tags =====> manufacturerTags & batch ==================>  ");

                }
                else {
                    await qaDB.collection("unassignedTags").insertOne(dataObj);

                    console.log("Tag not exist in digitized tags =====> unassignedTags ==================>  ");
                }

            }
            catch (error) {
                console.log("Error in ", error);
            }

        }
    }


    console.log("script completed ===> ");

})



