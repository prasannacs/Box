/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const BoxSDK = require('box-node-sdk');

exports.webhookTrigger = (req, res) => {
  let message = req.query.message || req.body.message || 'Hello World!';
  console.log('Event -- ',req.body);
  res.status(200).send(message);
};
