const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const dynamodbres = require('../common/createresourcedynamodb');

class CreateCustomerResources extends BaseHandler {
    constructor() {
        super();
    }

    async getAdminCustomerResources() {
        //this.log.debug("getAdminCustomerResources");
        const params = {
            TableName: 'admin-customer-resources-stage'  //TODO: stage
        };
        return await documentClient.scan(params).promise();
    }

    generateRandomcuid(min, max) {
        return (Math.random().toString(36).substring(min, max) + Math.random().toString(36).substring(min, max)).toUpperCase();
    }

    async process(event, context, callback) {
        //console.log("event.cuid:" + event.cuid);
        let cuid = this.generateRandomcuid(2, 6); // TODO get from addcustomer lambda function
        try {
            let resources = await this.getAdminCustomerResources();

            resources.Items.forEach(function (resource) {

                if (resource && 'name' in resource && resource.name && 'type' in resource && resource.type) {
                    //this.log.debug("resource:" + JSON.stringify(resource));
                    if (resource.type === 'dynamodb') {
                        let tableName = cuid + "-" + resource.name;
                        let resCreate = dynamodbres.createTable(tableName, resource.attributes.hashkey, resource.attributes.sortkey);
                        //this.log.info("Resource created successfully");
                    }
                }
                else {
                    // this.log.info('admin-customer-resource not configured properly');//TODO how to check speific error
                    return responseHandler.callbackRespondWithSimpleMessage(400, " !");
                }
            });
        }
        catch (err) {
            if (err.message) {
                return false;
            } else {
                return true;
            }
        }
    }
}

exports.createcustomerresources = async (event, context, callback) => {

    return await new CreateCustomerResources().handler(event, context, callback);
}