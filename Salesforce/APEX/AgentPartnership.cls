public with sharing class AgentPartnership {
    @future(callout=true)
    public static void createPartnership(Id recordId, Id userId) {
        // userId is Salesforce user Id
        // Instantiate the Toolkit object
        box.Toolkit boxToolkit = new box.Toolkit();

        // Create folder with editor permissions
        box.Toolkit.CollaborationType collabType = box.Toolkit.CollaborationType.PREVIEWER;
        String collabId = boxToolkit.createCollaborationOnRecord(userId, recordId, collabType, true);
        System.debug('Created new folder with collaboration id: ' + collabId);
		String objFolderId = boxToolkit.getObjectFolderByRecordId(recordId);
        System.debug('Box object id: --------- ' + objFolderId);
        system.debug('most recent error: ~~~~~~~~~ ' + boxToolkit.mostRecentError);
        // Commit changes
        boxToolkit.commitChanges();

    }
}
