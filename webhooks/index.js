/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const BoxSDK = require('box-node-sdk');
const jsonConfig = require('https://github.com/prasannacs/Box/blob/master/webhooks/CLI-private.json');
var sdk = BoxSDK.getPreconfiguredInstance(jsonConfig);
var client = sdk.getAppAuthClient('enterprise');

sdk.getEnterpriseAppAuthTokens('59194496', null, function (error, token) {
    console.log('Service account token ', token.accessToken);
})

exports.webhookTrigger = (req, res) => {
  let message = req.query.message || req.body.message || 'Hello World!';
  console.log('Event -- ',req.body);
  res.status(200).send(message);
};
