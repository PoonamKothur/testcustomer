const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const awsmanager = require('../common/awsmanager');
const fs = require('fs');

class CreateCustomerResources extends BaseHandler {
    constructor() {
        super();
    }

    // This function gets list of resources to be created for a customer
    async getAdminCustomerResources() {
        this.log.debug("getAdminCustomerResources");
//         const params = {
//             TableName: `admin-customer-resources-${process.env.STAGE}`
//         };
//         let data = await documentClient.scan(params).promise();

//         let data1 =  data.Items.sort((a, b) => (a.sequence > b.sequence) ? 1 : -1);
// console.log(JSON.stringify(data1));
        let file = fs.readFileSync('./datascripts/customerResources.json');
        let data = JSON.parse(file);
        return data;
    }

    // This function is used to create customer specific resources
    async createResources(resources, cuid) {
        let createdResources = [];
        let poolId = "";
        console.log(resources);
        for (let resource of resources) {
            this.log.debug("resource.type:" + resource.type);
            let resourceName = `${cuid}-${resource.name}`;

            console.log(resourceName);
            switch (resource.type) {
                case 'dynamodb':
                    console.log("in dynamodb case");
                    if ('attributes' in resource && resource.attributes && 'dynamodbparams' in resource.attributes && resource.attributes.dynamodbparams) {
                        let dynamodbparams = resource.attributes.dynamodbparams;
                        let tablename = dynamodbparams.TableName;
                        dynamodbparams.TableName = tablename.replace("{{cuid}}", cuid);
                        await awsmanager.createDynamoTable(dynamodbparams);
                    }
                    else {
                        //console.log("table schema not defined ");
                        return responseHandler.callbackRespondWithSimpleMessage('404', 'Table schema not defined');
                    }
                    createdResources.push({ name: resourceName, 'cuid': cuid, type: resource.type, status: "completed" });
                    break;
                case 'userpool':
                    console.log("in userpool case");
                    let poolResponse = await awsmanager.createUserPool(resourceName);
                    poolId = poolResponse.UserPool.Id;
                    createdResources.push({ name: resourceName, 'cuid': cuid, type: resource.type, status: "completed", attributes: { "poolid": poolid} });
                    break;
                case 'usergroup':
                    //First get pool id from created resources
                    // let userPoolDetails = createdResources.filter(f => f.type === 'userpool');
                    let groupResponse = await awsmanager.createUserGroup(resourceName, poolId);
                    this.log.debug(JSON.stringify(groupResponse));
                    createdResources.push({ name: resourceName, 'cuid': cuid, type: resource.type, status: "completed" });
                    break;
            }
        }
        // check if created resources
        if (createdResources && createdResources.length > 0) {
            for (let resource of createdResources) {
                this.log.debug(JSON.stringify(resource));
                // Simply use batch post to add to customers-resources-<stage>
                const params = {
                    TableName: `customer-resources-${process.env.STAGE}`,
                    Item: resource
                };
                let valRes = await documentClient.put(params).promise();
            }
        }
    }

    async process(event, context, callback) {
        try {
            // Check if cuid is present
            let resources = await this.getAdminCustomerResources();
            this.log.debug(resources);
            if (resources && resources.length > 0) {
                await this.createResources(resources, event.cuid);
            }
        }
        catch (err) {
            //console.log(err);
            this.log.debug(err);
        }
        return 'done';
    }
}

exports.createcustomerresources = async (event, context, callback) => {
    console.log("in lambda invokde");
    return await new CreateCustomerResources().handler(event, context, callback);
}