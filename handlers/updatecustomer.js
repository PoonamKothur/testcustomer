const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const utils = require('../common/utils');
const Joi = require('joi');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

class UpdateCustomerbyId extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    getValidationSchema() {
        this.log.info('Inside getValidationSchema');

        //validate body schema
        return Joi.object().keys({
            cid: Joi.string().required(),
            cuid: Joi.string().required(),
            type: Joi.string().valid(['Consumer', 'Enterprise']).required(),
            scope: Joi.string().valid(['Direct', 'Reseller']).required(),
            customerEmail: Joi.string().email().required(),
            primary: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                //phone: Joi.string().regex('^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4})')
            },
            secondary: {
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
                email: Joi.string().email().optional(),
                //phone: Joi.string().regex('^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4})').optional(),
                registration: Joi.date().optional().optional(),
                lastUpdate: Joi.date().optional()
            }
        });
    }

    async checkIfCustomerExists(cid) {
        let valRes = await dynamodb.get({
            TableName: `customers-${process.env.STAGE}`,
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

    /*async updateCustomer(cid, data) {
        let item = {
            cid: cid
        }
        const params = {
            TableName: `customers-${process.env.STAGE}`,
            Item: Object.assign(item, data)
        };
        console.log(JSON.stringify(data));
        let valRes = await dynamodb.put(params).promise();
        console.log(JSON.stringify(valRes));
        return valRes;
    }*/

    /*async updateCustomer(cid, data) {
      
        var params = {
            TableName: `customers-test`,
            Key:{
                cid: cid
            },
            UpdateExpression: "set cuid=:cuid, customerEmail=:custemail, primary.email=:primemail, primary.firstName=:primfirst, primary.lastName=:primlast, primary.phone=:primphone, secondary.firstName=:secfirst, secondary.last=:seclast, secondary.phone=:secphone",
            ExpressionAttributeValues:{
                ":cuid":data.cuid,
                ":custemail": data.customerEmail,
                ":scpe": data.scope,
                ":tpe": data.type,
              
            },
            ReturnValues:"UPDATED_NEW"
        };
        
        console.log(JSON.stringify(data));
        let valRes = await dynamodb.update(params).promise();
        console.log(JSON.stringify(valRes));
        return valRes;
    }*/

    async process(event, context, callback) {
        try {
            let body = event.body ? JSON.parse(event.body) : event;

            //await utils.validate(body, this.getValidationSchema());
            let customerExists = await this.checkIfCustomerExists(body.cid);

            this.log.debug("customerExists:" + customerExists);
            if (!customerExists) {                
                return responseHandler.callbackRespondWithSimpleMessage('400', 'Customer not exists');
            }

            // Call to update customer
            let updateResp = await this.updateCustomer(body.cid, body);

            let resp = {
                cid: body.cid,
                message: "Customer Updated Successfully"
            }

            return responseHandler.callbackRespondWithSimpleMessage(200, resp);
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

exports.updatecustomer = async (event, context, callback) => {
    return await new UpdateCustomerbyId().handler(event, context, callback);
}