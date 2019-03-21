// Imports the Google Cloud client libraries
const vision = require('@google-cloud/vision').v1;

// Creates a client
const client = new vision.ImageAnnotatorClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// Bucket where the file resides
const bucketName = 'staging.sixth-hawk-194719.appspot.com';
// Path to PDF file within bucket
const fileName = '/text-extraction/upload/invoice.pdf';

const gcsSourceUri = `gs://${bucketName}/${fileName}`;
const gcsDestinationUri = `gs://${bucketName}/${fileName}.json`;

const inputConfig = {
  // Supported mime_types are: 'application/pdf' and 'image/tiff'
  mimeType: 'application/pdf',
  gcsSource: {
    uri: gcsSourceUri,
  },
};
const outputConfig = {
  gcsDestination: {
    uri: gcsDestinationUri,
  },
};
const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
const request = {
  requests: [
    {
      inputConfig: inputConfig,
      features: features,
      outputConfig: outputConfig,
    },
  ],
};

const [operation] = await client.asyncBatchAnnotateFiles(request);
const [filesResponse] = await operation.promise();

const destinationUri =
  filesResponse.responses[0].outputConfig.gcsDestination.uri;
console.log('Json saved to: ' + destinationUri);
