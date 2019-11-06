const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const utils = require('../common/utils');
const Joi = require('joi');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

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
            type: Joi.string().valid(['Consumer', 'Enterprise']).required(),
            scope: Joi.string().valid(['Direct', 'Reseller']).required(),
            customerEmail: Joi.string().email().required(),
            primary: {
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
            }
        });
    }

    // This function is used to get customer by cid
    async checkIfCustomerExists(cid) {
   
        let valRes = await dynamodb.get({
            // TableName: `customer-${process.env.STAGE}`,
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
        const cuid = this.generateRandomcuid(2,6);
        let item = {
            cuid: cuid,
            cid: body.cid,
            type: body.type,
            scope: body.scope,
            customerEmail: body.customeremail,
            primary: { 
                firstname: body.primary.firstname,
                //lastName: body.primary.lastName,
                //email: body.primary.email,
                //phone: body.primary.phone
            },
            /*secondary: {
                firstName: body.secondary.firstName,
                lastName: body.secondary.lastName,
                email: body.secondary.email,
                phone: body.secondary.phone,
                registration: body.secondary.registration,
                lastUpdate: body.secondary.lastUpdate
            }*/
        }
        const params = {
            // TableName: `customer-${process.env.STAGE}`,
            TableName: 'customer',
            Item: Object.assign(item)
        };
        let valRes = await dynamodb.put(params).promise();
        return cuid;
    }

    ///get lookup table resources data 

    async createCustomerResources(cuid) {
        let item = {
            id: cuid + '-' + '-role-membership',
            attributes: {
                pool_id: 12
            },
            status: 'success'
        }
        const params = {
            // TableName: `admin-customer-resources-${process.env.STAGE}`,
            TableName: 'admin-customer-resources',
            Item: Object.assign(item)
        };
        return dynamodb.put(params).promise();
    }

    async process(event, context, callback) {

        try {
            let body = event.body ? JSON.parse(event.body) : event;

            // Validate the input
            await utils.validate(body, this.getValidationSchema());

            // Check if cid already exists
            let customerExists = await this.checkIfCustomerExists(body.cid);
            console.log("customerExists:" + customerExists);
            if (customerExists) {
                return responseHandler.callbackRespondWithSimpleMessage('400', 'Duplicate customer');
            }
            
            // Call to insert customer
            let cuid = await this.createCustomer(body);
            
            //call insert customerresorces
            await this.createCustomerResources(cuid);
            
            return responseHandler.callbackRespondWithSimpleMessage(200, ' Customer Created Successfully ');
        }

        catch (err) {
            console.log(err);
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