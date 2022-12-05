const  mongoose  = require("mongoose");
mongoose.connect('mongodb://localhost:27017/elasticsearch');
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection Successful!");
    // var elastic = mongoose.Schema({
    //     tenantId: {
    //         type: String,

    //     },
    //     batchId: {
    //         type: String,
    //     },
    //     userId: {
    //         type: String,

    //     },
    //     processId: {
    //         type: String,

    //     },
    //     productId: {
    //         type: String,

    //     },
    //     productExperienceId: {
    //         type: String,

    //     },
    //     productExperienceStudioId: {
    //         type: String,

    //     },
    //     productExperienceTenantId: {
    //         type: String,

    //     },
    //     productUpc: {
    //         type: String,

    //     },
    //     status: {
    //         type: String,
    //     },
    //     site: {
    //         type: String,

    //     }
    // })
let Data =[
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
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: '7fbb1d48d18227',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: '7682a55c-3a6f-459e-8320-e713b09c60e2',
      productId: 'b6fd325e-5d47-404c-adce-d7e04d601b7f',
      productExperienceId: undefined,
      productExperienceStudioId: undefined,
      productExperienceTenantId: undefined,
      productUpc: undefined,
      status: 'DE-ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: 'testbatch123',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: '318d1a1d-cc74-4f2e-a2c5-83a68deff487',
      productId: 'eb2ead73-bd01-4038-961f-b40e9c115b53',
      productExperienceId: '243',
      productExperienceStudioId: 'bluebite:es:a5931d6f-853d-4077-8fbc-e1df2bc222d2',
      productExperienceTenantId: '590',
      productUpc: '72527273070',
      status: 'DE-ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: 'testbatchabc',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: '318d1a1d-cc74-4f2e-a2c5-83a68deff487',
      productId: 'eb2ead73-bd01-4038-961f-b40e9c115b53',
      productExperienceId: '243',
      productExperienceStudioId: 'bluebite:es:a5931d6f-853d-4077-8fbc-e1df2bc222d2',
      productExperienceTenantId: '590',
      productUpc: '72527273070',
      status: 'DE-ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: '4d0a50c9dfb27b',
      userId: 'auth0|5ba90206ff2deb49c8b8b374',
      processId: '33468446-c229-4975-b82b-bfcbed22ec80',
      productId: '1209acb4-667b-4791-bd25-dcf6ad66da48',
      productExperienceId: undefined,
      productExperienceStudioId: undefined,
      productExperienceTenantId: undefined,
      productUpc: undefined,
      status: 'ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: '521c0368194e3b',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: '6dd95cc5-e09b-4527-9fdc-3022ca59cfc5',
      productId: '40f58ac9-62ea-4e29-a66c-b26423c0934d',
      productExperienceId: undefined,
      productExperienceStudioId: undefined,
      productExperienceTenantId: undefined,
      productUpc: undefined,
      status: 'DE-ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: 'BATCH0605_1',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: '152dabc7-93ae-431e-93c3-746ccf74723a',
      productId: '6783f9e2-9249-46a5-88b7-99bee2b95373',
      productExperienceId: '243',
      productExperienceStudioId: 'bluebite:es:e7483feb-8977-4036-8e3a-48057a5b4596',
      productExperienceTenantId: '590',
      productUpc: '191530391136',
      status: 'DE-ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: 'BATCH1105_2',
      userId: 'auth0|5ba90204ff2deb49c8b8b370',
      processId: '152dabc7-93ae-431e-93c3-746ccf74723a',
      productId: '6783f9e2-9249-46a5-88b7-99bee2b95373',
      productExperienceId: '243',
      productExperienceStudioId: 'bluebite:es:e7483feb-8977-4036-8e3a-48057a5b4596',
      productExperienceTenantId: '590',
      productUpc: '191530391132',
      status: 'DE-ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: 'fe679bc7e09458',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: 'ec8521ff-92d0-4387-b429-b56a5395202f',
      productId: '83092796-e35d-43f9-9e40-be908624184a',
      productExperienceId: undefined,
      productExperienceStudioId: undefined,
      productExperienceTenantId: undefined,
      productUpc: '181530337777',
      status: 'ENABLED'
    },
    {
      tenantId: '82f2cfc3-a528-4de2-a740-dc37d9a120a2',
      batchId: '91116d1693c192',
      userId: 'auth0|5b3b73ea473711030ef2451e',
      processId: 'ec8521ff-92d0-4387-b429-b56a5395202f',
      productId: '83092796-e35d-43f9-9e40-be908624184a',
      productExperienceId: undefined,
      productExperienceStudioId: undefined,
      productExperienceTenantId: undefined,
      productUpc: '181530334236',
      status: 'ENABLED'
    }
  ]
  

// console.log(Data);
//const Elastic = mongoose.model('edata',elastic)
// console.log("convert",convert)
// var eData = new Elastic(convert)
// eData.save(function(err,Elastic){
//     if(err)return console.error(err);
//     console.log(Elastic,"Elastic");
// })
db.collection("edatas").insertMany(Data,function(err,res){
    if(err) throw err;
    console.log("inserted");
    db.close();
})

})


