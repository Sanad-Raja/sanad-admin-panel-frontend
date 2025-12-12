// Query keys for React Query
export const QUERY_KEY = {
  GET_USER: "getUser",
  GET_CAMPAIGNS: "getCampaigns",
  GET_ANSARS: "getAnsars",
  SEND_NOTIFICATION: "sendNotification",
}

// Mock data for campaigns

import { CampaignStatus, CampaignType } from "@/types/campaign.types";

export const campaignStatusOptions = [{
  label: "Yet To Approve",
  value: CampaignStatus.yetToApprove,
},
{
  label: "Approved",
  value: CampaignStatus.approved,
},
{
  label: "Yet To Disburse",
  value: CampaignStatus.yetToDisburse,
},
{
  label: "Disbursed",
  value: CampaignStatus.disbursed,
}
];

export const campaignTypeOptions = [{
  label: "Zakat",
  value: CampaignType.zakat,
},
{
  label: "Sadaqa",
  value: CampaignType.sadaqa,
},
{
  label: "Jariya",
  value: CampaignType.jariya,
}
];

export const countries = [{
  label: "India",
  value: "+91",
},
{
  label: "USA",
  value: "+1",
}
];

export const PAGE_SIZE = 10; // Default pageSize