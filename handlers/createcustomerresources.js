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
        console.log("getAdminCustomerResources");
        const params = {
            TableName: 'admin-customer-resources-stage'  //TODO: stage
        };
        return await documentClient.scan(params).promise();
    }

    generateRandomcuid(min, max) {
        return (Math.random().toString(36).substring(min, max) + Math.random().toString(36).substring(min, max)).toUpperCase();
    }

    async process(event, context, callback) {
        console.log("event.cuid:" + event.cuid);
        let cuid = this.generateRandomcuid(2, 6); // TODO get from event
        try {
            //get 
            let resources = await this.getAdminCustomerResources();
            //console.log("resources:" + JSON.stringify(resources));
            resources.Items.forEach(function (resource) {
                
                    if (resource && 'name' in resource && resource.name && 'type' in resource && resource.type) {
                        console.log("resource:" + JSON.stringify(resource));
                        if (resource.type === 'dynamodb') {
                            console.log("in check dynamodb");
                            let tableName = cuid + "-" + resource.name;
                            let resCreate = dynamodbres.createTable(tableName, resource.attributes.hashkey, resource.attributes.sortkey);
                            this.log.info("Resource created successfully");//TODO speific error

                        }
                    }
                    else {
                        this.log.info('admin-customer-resource not configured properly');//TODO speific error
                        return responseHandler.callbackRespondWithSimpleMessage(400, " !");
                    }
            });

            if (resources && 'Items' in resources) {
                console.log("resources.Items.Count:" + resources.Items.length);
                for (i = 0; i < resources.Items.length; i++) {   //TODO: for loop 
                    
                    let resource = resources.Items[i];
                    console.log("resource:" + resource);
                    if (resource && 'name' in resource && resource.name && 'type' in resource && resource.type) {
                        console.log("resource.type:" + resource.type);
                        if (resource.type === 'dynamodb') {
                            console.log("in check dynamodb");
                            let tableName = event.cuid + "-" + resource.name;
                            let resCreate = await dynamodbres.createTable(tableName, resource.attributes.hashkey, resource.attributes.sortkey)
                        }
                    }
                    else {
                        this.log.info('admin-customer-resource not configured properly');//TODO speific error
                        return responseHandler.callbackRespondWithSimpleMessage(400, " !");
                    }
                }
            }
            else {
                return responseHandler.callbackRespondWithSimpleMessage(400, "No customer found !");
            }
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
    console.log('Lambda B Received event:', JSON.stringify(event, null, 2));
    context.succeed('Hello ' + event.cuid);
    return await new CreateCustomerResources().handler(event, context, callback);
}