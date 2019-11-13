const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const utils = require('../common/utils');
const Joi = require('joi');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

class CustomerResourcesData extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        try {
            console.log("in process");
            file = File.read('~/datascripts/loaddata.json')
            data = JSON.parse(file)
            console.log(data);
            params = {
                tablename: `admin-customer-resources-${process.env.STAGE}`,
                item: data
            }

            //let valRes = await dynamodb.put(params).promise();
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