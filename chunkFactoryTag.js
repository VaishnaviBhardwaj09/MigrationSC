const mongoose = require("mongoose");
var uuid = require('uuid')

console.log("Started the Script>>>>>>>>>>>>>>>>>>")

// old prod string url
const uri = 'mongodb://diUser:6A200sj9ZlHjuXZHtIo2@sc-prod-new-di-database.cluster-ckpzwf1jxpvt.eu-west-1.docdb.amazonaws.com:27017/digital-identity?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false'
var oldDB = mongoose.createConnection(uri, { tlsCAFile: `rds-combined-ca-bundle.pem` });
// var oldDB = mongoose.createConnection();
// connect to database
// await oldDB.openUri(uri, { tlsCAFile: `rds-combined-ca-bundle.pem` });

oldDB.on('error', console.error.bind(console, 'connection error:'));


// new prod string url
// var qaDB = mongoose.createConnection('mongodb://sc-production-solution-cosmosdb:Ez36mJ2V6phUbj9kgSyJPQ0ycQuSbLx0wmVUMQZNqRVNbUlywQHPP01qEKEdNQddWHsxPXxiDirpACDbBFp3YA==@sc-production-solution-cosmosdb.mongo.cosmos.azure.com:10255/smartcosmos?ssl=true&replicaSet=globaldb&retrywrites=false');

var qaDB = mongoose.createConnection();
// connect to database
await qaDB.openUri('mongodb://sc-production-solution-cosmosdb:Ez36mJ2V6phUbj9kgSyJPQ0ycQuSbLx0wmVUMQZNqRVNbUlywQHPP01qEKEdNQddWHsxPXxiDirpACDbBFp3YA==@sc-production-solution-cosmosdb.mongo.cosmos.azure.com:10255/smartcosmos?ssl=true&replicaSet=globaldb&retrywrites=false');
qaDB.on('error', console.error.bind(console, 'connection error:'));



oldDB.once('open', async function () {
    console.log("Connection Successful!");
    // manufacture data object
    let distinctBatchIdRow = await qaDB.collection("uninsertBatch").find({ tagsLength: { $gt: 0 } })
    let distinctBatchId = await distinctBatchIdRow.toArray()


    console.log("DistinctBatchId======================>", distinctBatchId)
    let chunkSize = 5000
    let totalInserted = 0
    for (let batch of distinctBatchId) {
        let bulkDataObj = []
        let diBulkDataObj = []
        let batchId = batch.batchId
        let custBT = new Date().getTime()
        let customerBatchData = await oldDB.collection("CustomerBatch").findOne({ 'batchId': batchId });
        console.log("Customer BatchData ", new Date().getTime() - custBT, batchId)


        let custBT2 = new Date().getTime()
        let customerData = await oldDB.collection("Customer").findOne({ 'customerId': customerBatchData.customerId });
        console.log("Customer  ", new Date().getTime() - custBT2)
        let ct = 0 // Use to count Inserted tags per batchId

        let custBT3 = new Date().getTime()

        let loopCount = 0
        while (true) {
            let tagsData = await oldDB.collection("Tag").find({ bId: batchId }).skip(loopCount).limit(chunkSize).toArray();
            console.log("TagData", new Date().getTime() - custBT3, tagsData.length) //1000
            if(tagsData.length === 0) break;


            // Tag Id per batchId
            let tagIds = tagsData.map(i => i._id)


            await bulkDataInsertionFunction(tagIds)

            
            // BULK INSERT FUNCTION>>>>>>>>>>>>>>>>>>>.
            async function bulkDataInsertionFunction(tagIds) {
                let diCt = new Date().getTime()
                let distinctDigitizedData = await qaDB.collection("digitizedtags").find({ diId: { $in: tagIds } }).toArray();
                console.log("distinctDigitizedData Time", distinctDigitizedData, new Date().getTime() - diCt,)
                let digitizedTagData = []
                let unDigitizedTagData = []
                let batchDataObj = {}
                let mapCt = new Date().getTime()
                let result = tagsData.map(ele => {
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

                    dataObj.orderId = customerBatchData.orderId;
                    dataObj.orderDate = customerBatchData.orderDate;
                    dataObj.orderQuantity = customerBatchData.orderQuantity;
                    dataObj.orderQuantityUnit = customerBatchData.orderQuantityUnit;
                    dataObj.deliveryDate = customerBatchData.deliveryDate;
                    dataObj.deliveryItemName = customerBatchData.deliveryItemName;
                    dataObj.deliveryQuantity = customerBatchData.deliveryQuantity;
                    dataObj.deliveryQuantityUnit = customerBatchData.deliveryQuantityUnit;
                    dataObj.inlayItemName = customerBatchData.batchProperties.inlayItemName;
                    dataObj.inlayType = customerBatchData.batchProperties.inlayType;
                    dataObj.customerName = customerData.customerName;
                    dataObj.manufacturerName = customerData.customerName;


                    if (distinctDigitizedData.find(i => i.diId === ele._id)) {
                        let data = distinctDigitizedData.find(i => i.diId === ele._id)
                        if (data) {
                            dataObj.tenantId = data.tenantId;
                            dataObj.tenantName = data.tenantName;
                            dataObj.tagId = ele._id;
                            dataObj.batchId = ele.bId;
                            dataObj.secureKey = ele.seq;   // doubt
                            dataObj.tagType = ele.ttl;    // doubt
                            batchDataObj.batchId = ele.bId;
                            dataObj.historyReferenceId = uuid.v4();
                            dataObj.status = 'active';
                            dataObj.isActivated = true;
                            digitizedTagData.push(dataObj)
                            dataObj = null

                        }

                    } else {
                        dataObj.tagId = ele._id;
                        dataObj.batchId = ele.bId;
                        dataObj.secureKey = ele.seq;   // doubt
                        dataObj.tagType = ele.ttl;    // doubt
                        batchDataObj.batchId = ele.bId;
                        dataObj.historyReferenceId = uuid.v4();
                        // let restdata = {...dataObj,_id}
                        unDigitizedTagData.push(dataObj)
                        console.log(batchDataObj)
                        dataObj = null
                    }

                })
                console.log("Map per Batch", batchDataObj, new Date().getTime() - mapCt)

                return Promise.all(result).then(async () => {
                    console.log('DigitizedData length', digitizedTagData.length, "UnDegitized data length", unDigitizedTagData.length)
                    if (digitizedTagData.length) {
                        console.log('digitize data', digitizedTagData[0])
                        for (let ditag of digitizedTagData) {
                            delete ditag._id
                            batchDataObj.historyReferenceId = uuid.v4();
                            batchDataObj.tenantId = ditag.tenantId;
                            batchDataObj.tenantName = ditag.tenantName;
                            batchDataObj.status = 'Active';
                            if (diBulkDataObj.length < 500 && tagsData.length - ct > 500) {
                                diBulkDataObj.push(ditag)
                                console.log("Add Data in Di Bulk remaining is > 500 >>>>>>>>>>>>>>>>>>>>", diBulkDataObj.length)
                                continue

                            } else if (tagsData.length - ct <= 500 && tagsData.length !== ct + diBulkDataObj.length) {
                                diBulkDataObj.push(ditag)
                                console.log("Add Data in Di Bulk remaining is < 500 >>>>>>>>>>>>>>>>>>>>", diBulkDataObj.length)
                                continue

                            }

                            let manufactureData = await qaDB.collection("manufacturertags").insertMany(diBulkDataObj);
                            console.log("Insert in Manufacture", manufactureData);

                            await qaDB.collection("batches").updateOne({ batchId: batchDataObj.batchId }, { $set: batchDataObj }, { upsert: true })
                            totalInserted = totalInserted + diBulkDataObj.length

                            console.log("Tag Inserted  in digitized tags for BatchId ", batch, ct, "out of ", tagsData.length, "and total Inserted", totalInserted);
                            diBulkDataObj = []
                        }
                    }
                    if (unDigitizedTagData.length) {
                        console.log('Undigitize data', unDigitizedTagData[0], batchDataObj)
                        for (let undiTag of unDigitizedTagData) {
                            try {
                                delete undiTag._id
                                if (bulkDataObj.length < 500 && unDigitizedTagData.length - ct > 500) {
                                    bulkDataObj.push(undiTag)
                                    console.log("Add Data in Bulk > 500 >>>>>>>>>>>>>>>>>>>>", bulkDataObj.length)
                                    continue
                                } else if (unDigitizedTagData.length - ct <= 500 && unDigitizedTagData.length !== ct + bulkDataObj.length + 1) {
                                    bulkDataObj.push(undiTag)
                                    console.log("Add Data in  Bulk < 500 >>>>>>>>>>>>>>>>>>>>", bulkDataObj.length)
                                    continue
                                }

                                bulkDataObj.push(undiTag)
                                let insertCt = new Date().getTime()
                                let unAssignedTag = await qaDB.collection("unassignedtags").insertMany(bulkDataObj);
                                console.log("Insert in unassignedTags", unAssignedTag, ct, new Date().getTime() - insertCt,);

                                const st = new Date().getTime()
                                await qaDB.collection("unassignedbatch").updateOne({ batchId: batchDataObj.batchId }, { $set: batchDataObj }, { upsert: true })
                                console.log("Insert in unassignedBatch with upsert  >>>>>>>>>>>>>>>>>>>>>>>>>>>>", batchDataObj.batchId, new Date().getTime() - st, batchDataObj)
                                ct = ct + bulkDataObj.length
                                totalInserted = totalInserted + bulkDataObj.length
                                console.log("Tag Inserted  in  Unassignedtags for BatchId ", batch, ct, "out of ", unDigitizedTagData.length, "and total Inserted", totalInserted);
                                bulkDataObj = []
                            } catch (err) {
                                console.log("error in Insertion >>>",)
                            }
                        }
                    }
                    return

                });


            }
            loopCount = loopCount + tagsData.length

        }






    }




})
