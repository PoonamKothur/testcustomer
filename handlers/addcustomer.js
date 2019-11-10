const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const utils = require('../common/utils');
//const Joi = require('joi');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

class AddCustomer extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    generateRandomcuid(min, max) {
        return (Math.random().toString(36).substring(min, max) + Math.random().toString(36).substring(min, max)).toUpperCase();
    }

    getValidationSchema() {
        this.log.info('Inside getValidationSchema');

        //validate body schema
        return Joi.object().keys({
            cid: Joi.string().required(),
            // type: Joi.string().valid(['Consumer', 'Enterprise']).required(),
            // scope: Joi.string().valid(['Direct', 'Reseller']).required(),
            // customerEmail: Joi.string().email().required(),
            /*primary: {
                firstName: Joi.string().required(),
                //lastName: Joi.string().required(),
                //email: Joi.string().email().required(),
                //phone: Joi.string().regex('[+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}')
            },
            secondary: {
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
                email: Joi.string().email().optional(),
                phone: Joi.string().regex('[+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}'),
                registration: Joi.date().optional().optional(),
                //lastUpdate: Joi.date().optional()
            }*/
        });
    }

    // This function is used to get customer by cid
    async checkIfCustomerExists(cid) {

        let valRes = await dynamodb.get({
            //TableName: 'customer-${process.env.STAGE}',
            TableName: 'customer',
            Key: {
                cid: cid
            },
            ProjectionExpression: 'cid'
        }).promise();

        if (valRes && 'Item' in valRes && valRes.Item && 'cid' in valRes.Item && valRes.Item.cid) {
            return true;
        } else {
            return false;
        }
    }

    //values insert if customer does not exists
    async createCustomer(body) {
        const cuid = this.generateRandomcuid(2, 6);
        let item = {
            cuid: cuid
        }
        const params = {
            TableName: 'customer-${process.env.STAGE}',
            Item: Object.assign(item, body)
        };
        let valRes = await dynamodb.put(params).promise();
        return cuid;
    }

    async process(event, context, callback) {

        try {
            let body = event.body ? JSON.parse(event.body) : event;

            // Validate the input
            //await utils.validate(body, this.getValidationSchema());
            this.log.debug(body);
            // Check if cid already exists
            //let customerExists = await this.checkIfCustomerExists(body.cid);
            // this.log.debug("");
            // this.log.debug("customerExists:" + customerExists);
            // if (customerExists) {
            //     return responseHandler.callbackRespondWithSimpleMessage('400', 'Duplicate customer');
            // }

            // // Call to insert customer
            // let cuid = await this.createCustomer(body);

            // //invoke lambda customerresources

            // /*let params = {
            //     FunctionName: process.env.CREATE_CR_LAMBDA_ARN, //TODO get from process.env
            //     InvocationType: 'Event',
            //     //Payload: JSON.stringify({cuid:cuid})
            //     Payload: JSON.stringify({ cuid: 'abcd' })
            // };
            // console.log("test lambda");
            // console.log(params);
            // await lambda.invoke(params).promise();
            // */
            return responseHandler.callbackRespondWithSimpleMessage(200, ' Customer Created Successfully ');
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

exports.createcustomer = async (event, context, callback) => {
    return await new AddCustomer().handler(event, context, callback);
}