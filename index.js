var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });
var mongoose = require('mongoose');
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
    // });
   
    client.ping({
        requestTimeout: 30000,
    },
        function (error) {
            if (error) {
                console.error('Cannot connect to Elasticsearch.');
                console.error(error);

            } else {
                console.log('Connected to Elasticsearch was successful!');
            }
        });
    if (client) {

        client.search({
            index: 'batches-gs1',
            type: '_doc',
            body: {
                query: {
                    // match: { "id": "sHElzW8BnivhMtrOhTOn6" }
                    "match_all": {}
                },
            }
        }
            , function (error, response, status) {
                if (error) {
                    console.log("search error: " + error)
                }
                else {
                    let final = []
                    let elasticData
                    response.hits.hits.forEach(function (hit) {
                        elasticData = {
                            tenantId: hit._source.source.tenantId,
                            batchId: hit._source.source.batchId,
                            userId: hit._source.source.lastOperator.id,
                            processId: hit._source.source.processId,
                            productId: hit._source.source.productId,
                            productExperienceId: hit._source.source.metadata.product.experienceId,
                            productExperienceStudioId: hit._source.source.metadata.product.experienceStudioId,
                            productExperienceTenantId: hit._source.source.metadata.product.experienceTenantId,
                            productUpc: hit._source.source.metadata.product.UPC,
                            status: hit._source.source.status,
                            //  site: hit._source.source.factory
                        }
                        let Data = final.push(elasticData)
                        console.log("Data".Data)
                        db.collection("edatas").insertMany(Data,function(err,res){
                            if(err)throw err;
                            console.log("Inserted Successfully")
                            db.close();
                        })
                        // var Elastic = mongoose.model('edata', elastic)
                        // var eData = new Elastic({ Data })

                        // eData.save(function (err, Elastic) {
                        //     if (err) return console.error(err);
                        //     console.log(Elastic ,"Elastic");
                        // });
                    })
                    console.log(final);
               }
            });
    }
    else {
        console.log("FINISH")
    }
})