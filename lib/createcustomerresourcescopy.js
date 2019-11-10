const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const awsmanager = require('../common/awsmanager');
let cuid = "";
let poolId = "";

class CreateCustomerResources extends BaseHandler {
    constructor() {
        super();
    }

    generateRandomcuid(min, max) {
        return (Math.random().toString(36).substring(min, max) + Math.random().toString(36).substring(min, max)).toUpperCase();
    }

    async getAdminCustomerResources() {
        this.log.debug("getAdminCustomerResources");
        const params = {
            TableName: 'admin-customer-resources-stage'  //TODO: stage
        };
        let data = await documentClient.scan(params).promise();
        return data.Items.sort((a, b) => (a.sequence > b.sequence) ? 1 : -1);
    }

    async createResources(resources) {
        for (let resource of resources) {
            console.log("resource.type:" + resource.type);
            switch (resource.type) {
                case 'dynamodb':
                    let tableName = cuid + "-" + resource.name;
                    let resTable = await awsmanager.createDynamoTable(tableName, resource);
                    break;
                case 'userpool':
                    let poolName = cuid + "-" + resource.name;
                    let resPoolId = await awsmanager.createUserPool(poolName);
                    console.log("resPoolId:" + resPoolId);
                    if (resPoolId)
                        poolId = resPoolId;
                    break;
                case 'usergroup':
                    let groupName = cuid + "-" + resource.name;
                    let resGroupId = await awsmanager.createUserGroup(groupName, poolId);
                    console.log("resGroupId:" + resGroupId);
                    if (resPoolId)
                        poolId = resPoolId;
                    break;
            }
        }
    }

    async process(event, context, callback) {
        cuid = this.generateRandomcuid(2, 6); // TODO get from addcustomer lambda function

        try {
            let resources = await this.getAdminCustomerResources();
            await this.createResources(resources);
        }
        catch (err) {
            console.log(err);
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