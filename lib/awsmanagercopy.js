const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const log4js = require("log4js");
const log = log4js.getLogger();

exports.createDynamoTable = async (tablename, resource) => {
    let params = {
        TableName: tablename,       //TODO: add stage option
        KeySchema: [
            { AttributeName: resource.attributes.hashkey, KeyType: "HASH" },  //Partition key
            { AttributeName: resource.attributes.sortkey, KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: resource.attributes.hashkey, AttributeType: "S" },
            { AttributeName: resource.attributes.sortkey, AttributeType: "S" }
        ],
        "BillingMode":
            "PAY_PER_REQUEST"
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2)); //TODO speific error
        } else {
            console.log("'" + params.TableName + "' Table created successfully");
            log.debug("'" + params.TableName + "' Table created successfully");
            log.debug("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

exports.createUserPool = async (poolName) => {
    let params = {
        PoolName: poolName, /* required */
    };
    await cognitoidentityserviceprovider.createUserPool(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return null;
        }
        else {
            console.log("'" + params.PoolName + "' User Pool created successfully");
            log.debug("'" + params.PoolName + "' User Pool created successfully");
            log.debug("User Pool description JSON:", JSON.stringify(data, null, 2));
            //  createUserGroup("TestGroup-123", data.UserPool.Id);
            //  return data.UserPool.Id;
        }
    });
}

exports.createUserGroup = async (groupName, userPoolId) => {
    let params = {
        GroupName: groupName, /* required */
        UserPoolId: userPoolId       /* required */
    };
    cognitoidentityserviceprovider.createGroup(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return null;
        }
        else {
            console.log("'" + params.GroupName + "' User Group created successfully");
            log.debug("'" + params.GroupName + "' User Group created successfully");
            log.debug("User Group description JSON:", JSON.stringify(data, null, 2));
            return params.GroupName;
        }
    });
}