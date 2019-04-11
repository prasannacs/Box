/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const BoxSDK = require('box-node-sdk');
const fs = require('fs');
var jsonConfig = JSON.parse(fs.readFileSync('Salesforce-Jingos.json', 'utf8'));

var sdk = BoxSDK.getPreconfiguredInstance(jsonConfig);
var client = sdk.getAppAuthClient('enterprise');

sdk.getEnterpriseAppAuthTokens('59194496', null, function (error, token) {
    console.log('Service account token ', token.accessToken);
})

exports.webhookTrigger = (req, res) => {
    let message = req.query.message || req.body.message || 'Hello World!';
    console.log('Event -- ', req.body);
    if (req.body != undefined) {
        var event = req.body.trigger;
        var createdBy = req.body.created_by;
        console.log('--> ', createdBy);
        var source = req.body.source;
        var userId;
        var resourceId;
        if (createdBy != undefined && createdBy.type == 'user') {
            userId = createdBy.id;
            var appClient = sdk.getAppAuthClient('user', userId);
            if (source != undefined && source.type == 'folder') {
                resourceId = req.body.source.id;
                if (event == 'FOLDER.CREATED' || event == 'FOLDER.UPLOADED') {
                    //client.collaborations.createWithUserID(userId, '71962138406', client.collaborationRoles.EDITOR);
                    //appClient.folders.move('0', '71962138406');
                }
            }

            if (source != undefined && source.type == 'file') {
                resourceId = req.body.source.id;
                if (event == 'METADATA_INSTANCE.UPDATED') {
                    appClient.files.get(resourceId)
                        .then(file => {
                            var parent = file.parent;
                            if (parent != undefined && parent.type == 'folder') {
                                var folderId = parent.id;
                                appClient.folders.get(folderId)
                                    .then(folder => {
                                        var parentFolderId = folder.parent.id;
                                        appClient.folders.create(parentFolderId, 'Locked artifacts')
                                    });
                            }
                        });
                }

            }
            if (event == 'FILE.UPLOADED') {
                // add comments to the file
                appClient.comments.create(resourceId, 'New file added');
                appClient.comments.create(resourceId, 'New file validated');
                appClient.files.get(resourceId)
                    .then(file => {
                        var parent = file.parent;
                        if (parent != undefined && parent.type == 'folder') {
                            var folderId = parent.id;
                            appClient.folders.get(folderId)
                                .then(folder => {
                                    var folderName = folder.name;
                                    var regex = /Upload/;
                                    folderName = folderName.replace(regex, 'Review')
                                    appClient.folders.update(folderId, { name: folderName }, null);
                                });
                            appClient.folders.applyWatermark(folderId);
                            var parentFolderName;
                            appClient.folders.get(folderId)
                                .then(folder => {
                                    parentFolderName = folder.parent.name;
                                });
                            appClient.folders.getMetadata(folderId, client.metadata.scopes.ENTERPRISE, 'case')
                                .then(metadata => {
                                    var metadataValues = {
                                        subject: metadata.subject,
                                        description: metadata.description,
                                        status: metadata.status,
                                        caseNumber: parentFolderName
                                    };
                                    appClient.files.addMetadata(resourceId, client.metadata.scopes.ENTERPRISE, "case", metadataValues);

                                });

                        }
                    });
                /*
                client.folders.create('70423468094', 'ACME CRO Results')
                    .then(folder => {
                        client.collaborations.createWithUserID('3725141744', folder.id, client.collaborationRoles.EDITOR)
                        client.folders.create(folder.id,'Accepted')
                            .then(folder =>   {
                            client.files.move(fileId,folder.id);
                        });
                });
                var options = {
                    message: 'Please review!',
                    due_at: '2019-04-03T11:09:43-07:00'
                };
                client.tasks.create(fileId, options)
                */
            }
        }
    }

}
res.status(200).send(message);
};
