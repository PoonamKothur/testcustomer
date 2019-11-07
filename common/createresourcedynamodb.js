const AWS = require('aws-sdk');
//const dynamodb = new AWS.DynamoDB.DocumentClient();

var dynamodb = new AWS.DynamoDB();

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
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Table '" + params.TableName + "' created successfully");//TODO speific error
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}