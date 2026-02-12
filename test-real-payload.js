const axios = require('axios');

// Real payload provided by the user
const payload = {
    "entity": {
        "customFieldValues": {
            "cfProjectionAmount": 0,
            "cfFirstOwner": "Manoj s bhashsms",
            "cfHighTicket": [
                {
                    "id": "2662606",
                    "value": "Not A High Ticket"
                }
            ]
        },
        "id": 42917966,
        "tenantId": 1744,
        "ownerId": {
            "id": "73362",
            "value": "wilson bhashsms"
        },
        "firstName": "Veerdavinder",
        "lastName": "Veerdavinder",
        "salutation": {
            "id": null,
            "name": null
        },
        "timezone": null,
        "address": "Veerdavinder",
        "city": "Veerdavinder",
        "state": null,
        "zipcode": null,
        "country": null,
        "department": "EMP@bhashsms.com",
        "dnd": null,
        "phoneNumbers": [
            {
                "id": 44693029,
                "type": "MOBILE",
                "code": "IN",
                "value": "1234567890",
                "dialCode": "+91",
                "primary": true
            }
        ],
        "emails": [
            {
                "type": "OFFICE",
                "value": "Clint@gmail.com",
                "primary": true
            }
        ],
        "facebook": null,
        "twitter": null,
        "linkedIn": null,
        "pipeline": {
            "id": "25111",
            "value": "BHASH SALES PIPELINE."
        },
        "pipelineStage": {
            "id": "173484",
            "value": "Interested"
        },
        "pipelineStageReason": null,
        "companyName": "Veerdavinder",
        "companyAddress": null,
        "companyCity": null,
        "companyState": null,
        "companyZipcode": null,
        "companyCountry": null,
        "companyEmployees": {
            "id": null,
            "name": null
        },
        "companyAnnualRevenue": null,
        "companyWebsite": null,
        "companyIndustry": null,
        "companyBusinessType": null,
        "companyPhones": null,
        "requirementName": "Business Whatsapp API-FB",
        "requirementCurrency": null,
        "requirementBudget": null,
        "expectedClosureOn": null,
        "products": [
            {
                "id": 439837,
                "name": "...",
                "tenantId": 1744
            }
        ],
        "conversionAssociation": null,
        "conversionAssociations": [],
        "convertedAt": null,
        "convertedBy": {
            "id": null,
            "name": null
        },
        "designation": null,
        "campaign": {
            "id": null,
            "name": null
        },
        "source": {
            "id": "44453",
            "value": "Facebook"
        },
        "forecastingType": "OPEN",
        "importedBy": {
            "id": null,
            "name": null
        },
        "createdAt": "2026-02-07T06:52:31.108Z",
        "updatedAt": "2026-02-12T11:27:26.248Z",
        "createdBy": {
            "id": "2512",
            "value": "Raj raj"
        },
        "updatedBy": {
            "id": "73362",
            "value": "wilson bhashsms"
        },
        "actualClosureDate": null,
        "createdViaId": "universal-app-key",
        "createdViaName": "Universal API Key",
        "createdViaType": "API Key",
        "updatedViaId": "73362",
        "updatedViaName": "User",
        "updatedViaType": "Web",
        "subSource": null,
        "utmSource": null,
        "utmMedium": null,
        "utmCampaign": null,
        "utmTerm": null,
        "utmContent": null,
        "score": 0,
        "isNew": false,
        "latestActivityCreatedAt": "2026-02-12T11:27:26.248Z",
        "meetingScheduledOn": null,
        "taskDueOn": null,
        "addressCoordinate": null,
        "companyAddressCoordinate": null
    },
    "entityType": "lead",
    "event": "LEAD_UPDATED",
    "webhookId": 5766,
    "tenantId": 1744,
    "eventId": "3a085022-c428-406b-bec3-81235cc7c491"
};

async function sendWebhook() {
    try {
        console.log("Sending webhook with real payload...");
        const response = await axios.post('http://localhost:3000/kylas-webhook', payload);
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error sending webhook:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

sendWebhook();
