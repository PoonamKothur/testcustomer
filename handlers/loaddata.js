const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const fs = require('fs');

class CustomerResourcesData extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            let file = fs.readFileSync('./datascripts/adminresourcesdata.json');
            this.log.debug(file);
            let data = JSON.parse(file);

            for (let resource of data) {
                this.log.debug(JSON.stringify(resource));

                const params = {
                    TableName: `admin-customer-resources`,
                    Item: resource
                };

                let valRes = await dynamodb.put(params).promise();
            }
        }
        catch (err) {
            if (err.message) {
                return responseHandler.callbackRespondWithSimpleMessage(400, err.message);
            } else {
                return responseHandler.callbackRespondWithSimpleMessage(500, 'Internal Server Error')
            }
        }
    };
}

exports.customerresourcesdata = async (event, context, callback) => {
    return await new CustomerResourcesData().handler(event, context, callback);
}