const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const awsmanager = require('../common/awsmanager');

class CreateCustomerResources extends BaseHandler {
    constructor() {
        super();
    }

    // This function gets list of resources to be created for a customer
    async getAdminCustomerResources() {

        this.log.debug("getAdminCustomerResources");
        const params = {
            TableName: `admin-customer-resources-${process.env.STAGE}`
        };
        let data = await documentClient.scan(params).promise();
        return data.Items.sort((a, b) => (a.sequence > b.sequence) ? 1 : -1);
    }

    // This function is used to create customer specific resources
    async createResources(resources, cuid) {
        let createdResources = [];
        for (let resource of resources) {
            this.log.debug("resource.type:" + resource.type);
            console.log("resource.type:" + resource.type);
            let resourceName = `${cuid}-${resource.name}`;
            switch (resource.type) {
                // case 'dynamodb':
                //     await awsmanager.createDynamoTable(resourceName, resource);
                //     createdResources.push({ name: resourceName, 'cuid': cuid, type: resource.type, status: "completed" });
                //     break;
                case 'userpool':
                    let poolResponse =  await awsmanager.createUserPool_inAWS(resourceName);
                    console.log("poolResponse....check if pool id "+ poolResponse);
                    //createdResources.push({ name: resourceName, 'cuid': cuid, type: resource.type, status: "completed"});
                   // console.log("created resources array after push in userpool" + createdResources);
                    break;      
                // case 'usergroup':
                //     //First get pool id from created resources
                //     // console.log("createdResources..........");
                //     // console.log(createdResources);
                //     //  let userPoolDetails = createdResources.filter(f => f.type === 'userpool');
                //     //  console.log("userPoolDetails ....................");
                //     // console.log(userPoolDetails);
                //     // // let resGroupId = await awsmanager.createUserGroup(resourceName, userPoolDetails[0].attributes.pool_id);
                //     // createdResources.push({ name: resourceName, 'cuid': cuid, type: resource.type, status: "completed", attributes: { group_id: resGroupId } });
                //  break;
            }
        }

        console.log('outside switch case');

        // // check if created resources
        // if (createdResources && createdResources.length > 0) {
        //     for (let resource of createdResources) {
        //         this.log.debug(JSON.stringify(resource));
        //         // Simply use batch post to add to customers-resources-<stage>
        //         const params = {
        //             TableName: `customer-resources-${process.env.STAGE}`,
        //             Item: resource
        //         };
        //         //let valRes = await documentClient.put(params).promise();
        //     }
        // }
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
            console.log(err);
            this.log.debug(err);
        }
        return 'done';
    }
}

exports.createcustomerresources = async (event, context, callback) => {
    return await new CreateCustomerResources().handler(event, context, callback);
}