const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const Joi = require('joi');
const utils = require('../common/utils');
const documentClient = new AWS.DynamoDB.DocumentClient();

class GetCustomerbyId extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    async getCustomerBycid(cid) {
        const params = {
            Key:{
                "cid" : cid
                },
            TableName: 'customer'
        };
        return documentClient.get(params).promise();
    }

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;                  
            if (event && 'pathParameters' in event && event.pathParameters && 'id' in event.pathParameters && event.pathParameters.id) {
                let cid = event.pathParameters.id;
                let res = await this.getCustomerBycid(cid);
                if (res && 'Item' in res) {
                    return responseHandler.callbackRespondWithJsonBody(200, res.Item);
                }
                return responseHandler.callbackRespondWithSimpleMessage(400, "No customer found !");
            }
            else{
                return responseHandler.callbackRespondWithSimpleMessage(400,"Please provide Id");
            }
        }

        catch (err) {
            if (err.message) {
                return responseHandler.callbackRespondWithSimpleMessage(400, err.message);
            } else {
                return responseHandler.callbackRespondWithSimpleMessage(500, 'Internal Server Error')
            }
        }
    }
}

exports.getcustomer = async (event, context, callback) => {
    return await new GetCustomerbyId().handler(event, context, callback);
}