const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const log4js = require("log4js");
const log = log4js.getLogger();

exports.createDynamoTable = async (params) => {
    await dynamodb.createTable(params).promise();
}

// exports.createDynamoTable = async (tablename, resource) => {
//     let params;
//     switch (resource.name) {
//         case 'entity':
//             if (resource.name === 'entity') {
//                 params = {
//                     TableName: tablename,       //TODO: add stage option
//                     KeySchema: [
//                         { AttributeName: resource.attributes.hashkey, KeyType: "HASH" },  //Partition key
//                         { AttributeName: resource.attributes.sortkey, KeyType: "RANGE" }  //Sort key
//                     ],
//                     AttributeDefinitions: [
//                         { AttributeName: resource.attributes.hashkey, AttributeType: "S" },
//                         { AttributeName: resource.attributes.sortkey, AttributeType: "S" }
//                     ],
//                     "BillingMode":
//                         "PAY_PER_REQUEST"
//                 };
//                 break;
//             }
//     }
//     dynamodb.createTable(params, function (err, data) {
//         if (err) {
//             console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2)); //TODO speific error
//         } else {
//             log.debug("Table created successfully. Table Name: " + params.TableName);
//             log.debug("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//         }
//     });
// }

exports.createUserPool = async (poolName) => {
    var promise = new Promise(function (resolve, reject) {
        console.log("Started User Pool creation...");
        log.debug("Started User Pool creation...");
        console.log("process.env.CREATE_CR_ROLE_ARN----------" + process.env.CREATE_CR_ROLE_ARN)
        try {
            let params = {
                PoolName: poolName, /* required */
                AutoVerifiedAttributes: [
                    "email"
                ],
                EmailConfiguration: {
                    EmailSendingAccount: "COGNITO_DEFAULT",
                },
                EmailVerificationMessage: 'Your username is {username}_emailverify and temporary password is {####}',
                EmailVerificationSubject: 'Your temporary password',
                VerificationMessageTemplate: {
                    DefaultEmailOption: 'CONFIRM_WITH_LINK',
                    //EmailMessage: `Your username is {####} and temporary password is {####}`,
                    EmailMessageByLink: `Please click the link below to verify your email address. {##Verify Email##} `,
                    //EmailSubject: 'Your temporary password',
                    EmailSubjectByLink: 'Your verification link',
                },
                MfaConfiguration: "ON",
                SmsConfiguration: {
                    SnsCallerArn: 'arn:aws:iam::738146172566:role/service-role/aws-SMS-Role'
                    //ExternalId: "f99c3ec1-63b4-425c-9099-20f560f528f5"
                },
                SmsVerificationMessage: `Your username is {####} and temporary password is {####}`,
                Schema: [
                    {
                        "AttributeDataType": "String",
                        "Mutable": true,
                        "Name": "cuid",
                    },
                    {
                        "AttributeDataType": "String",
                        "Mutable": true,
                        "Name": "cid",
                    },
                    {
                        "AttributeDataType": "String",
                        "Mutable": true,
                        "Name": "eid",
                    },
                    {
                        "AttributeDataType": "String",
                        "Mutable": true,
                        "Name": "euid",
                    }
                ]
            };
            cognitoidentityserviceprovider.createUserPool(params, function (err, data) {
                if (err) {
                    console.error(err);
                    log.error(err);
                    reject(err);
                } else {
                    log.debug("User Pool created successfully. Pool_Name: " + params.PoolName + ", Pool_Id" + data.UserPool.Id);
                    log.debug("User Pool description JSON:", JSON.stringify(data, null, 2));
                    resolve(data);
                }
            });
        } catch (cupE) {
            log.error(cupE);
            reject(cupE);
        }
    });
    return promise;
}

exports.createUserpoolClient = async (poolid) => {
    console.log("started userpool client creation...");
    let params = {
        "ClientName": "newclient", /* required */
        "UserPoolId": poolid, /* required */
        "ExplicitAuthFlows": [
            "ALLOW_CUSTOM_AUTH",
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_USER_SRP_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        "GenerateSecret": false,
        //"PreventUserExistenceErrors": "Enabled",
        "RefreshTokenValidity": 30,
    };
    console.log(params);
    let clientresp = await cognitoidentityserviceprovider.createUserPoolClient(params).promise();
    console.log(clientresp);
    return (clientresp);
};

exports.createUserGroup = async (groupName, userPoolId) => {
    var promise = new Promise(function (resolve, reject) {

        log.debug("Started User Group creation...");
        try {
            let params = {
                GroupName: groupName, /* required */
                UserPoolId: userPoolId       /* required */
            };
            cognitoidentityserviceprovider.createGroup(params, function (err, data) {
                if (err) {
                    console.error(err);
                    log.error(err);
                    reject(err);
                } else {
                    log.debug("User Group created successfully. Pool_Name: " + params.GroupName);
                    log.debug("User Group description JSON:", JSON.stringify(data, null, 2));
                    resolve(data);
                }
            });
        } catch (cupE) {
            log.error(cupE);
            reject(cupE);
        }
    });
    return promise;
}

exports.createUserPoolDomain = async (domainName, userPoolId) => {
    var promise = new Promise(function (resolve, reject) {

        log.debug("Started User Group creation...");
        try {
            let params = {
                Domain: domainName, /* required */
                UserPoolId: userPoolId       /* required */
            };
            cognitoidentityserviceprovider.createUserPoolDomain(params, function (err, data) {
                if (err) {
                    console.error(err);
                    log.error(err);
                    reject(err);
                } else {
                    console.error(data);
                    log.debug("User Pool Domain created successfully. Domain Name: " + params.domainName);
                    log.debug("User Pool Domain JSON:", JSON.stringify(data, null, 2));
                    resolve(data);
                }
            });
        } catch (cupE) {
            log.error(cupE);
            reject(cupE);
        }
    });
    return promise;
}