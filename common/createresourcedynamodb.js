const AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
const log4js = require("log4js");
const log = log4js.getLogger();

exports.createTable = async (tablename, hashkey, sortkey) => {
    var params = {
        TableName: tablename,       //TODO: add stage option
        KeySchema: [
            { AttributeName: hashkey, KeyType: "HASH" },  //Partition key
            { AttributeName: sortkey, KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: hashkey, AttributeType: "S" },
            { AttributeName: sortkey, AttributeType: "S" }
        ],
        "BillingMode": 
            "PAY_PER_REQUEST"
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2)); //TODO speific error
        } else {
            log.debug("Table created successfully");
            log.debug("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}