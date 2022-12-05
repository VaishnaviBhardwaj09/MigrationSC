var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = [
    {
        
    tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
    batchId: 'd63287c03bc0c4',
    userId: 'auth0|5b3b73ea473711030ef2451e',
    processId: 'e01d17f7-5ad6-4d4e-8d61-ef2c57630b7c',
    productId: 'aa819041-fcde-45d8-a018-9336685b8fb6',
    productExperienceId: undefined,
    productExperienceStudioId: undefined,
    productExperienceTenantId: undefined,
    productUpc: undefined,
    status: 'DE-ENABLED'
  
},
{
    tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a1265450a2',
    batchId: '7fbb1d48d65r618227',
    userId: 'auth0|5b3b73656ea473711030ef2451e',
    processId: '7682a55c-3a6f-459e-8320-e713b7609c60e2',
    productId: 'b6fd325e-5d47-404c-adce-d7e0465d601b7f',
    productExperienceId: undefined,
    productExperienceStudioId: undefined,
    productExperienceTenantId: undefined,
    productUpc: undefined,
    status: 'DE-ENABLED'
  }
]


  dbo.collection("customers").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
