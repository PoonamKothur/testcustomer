/*export function handler(event, context) {
    console.log('Lambda B Received event:', JSON.stringify(event, null, 2));
    context.succeed('Hello ' + event.name);
  }*/

/*const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const utils = require('../common/utils');
const Joi = require('joi');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

class CreateCustomerResources extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    async process(event, context, callback) {
        console.log(event.cuid);
        try{

        }
        catch{

        }
    }
}*/

exports.createcustomerresources = async (event, context, callback) => {
    return await new CreateCustomerResources().handler(event, context, callback);
}