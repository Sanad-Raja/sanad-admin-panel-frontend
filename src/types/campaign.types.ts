import { z } from "zod";

// Duration options
export const durationOptions = [
  "3 Months to 6 Months",
  "6 Months to a Year",
  "More than a Year",
  "I don't know them personally"
] as const

// Campaign type options
export enum CampaignType {
  zakat = "ZAKAT",
  sadaqa = "SADAQA",
  jariya = "JARIYA"
}

export const imageMetadata = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

export enum CampaignStatus {
  yetToApprove = "YET_TO_APPROVE",
  approved = "APPROVED",
  yetToDisburse = "YET_TO_DISBURSE",
  disbursed = "DISBURSED"
}
// Schema for campaign table filters
export const campaignFilterSchema = z.object({
  search: z.string().optional(),
  ansar: z.string().optional(),
  status: z.string().optional(),
  knownDuration: z.string().optional(),
  campaignDuration: z.string().optional(),
})

export type CampaignFilterField = z.infer<typeof campaignFilterSchema>

// Schema for creating/editing a campaign
export const campaignFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Campaign name is required" }).max(50, { message: "Campaign name must be less than 50 characters" }),
  campaignType: z.nativeEnum(CampaignType),
  knownDuration: z.string().nonempty({ message: "Known duration is required" }),
  campaignDuration: z.string().min(1, { message: "Campaign duration is required" }),
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0 && num < 1000;
  }, {
    message: "Amount should be between 1 and 999",
  }),
  description: z.string().nonempty({ message: "Description is required" }),
  newUsers: z.array(z.object({ phone: z.string() })).optional(),
  image: z.union([z.instanceof(File), imageMetadata]).nullable(),
})

export type CampaignFormField = z.infer<typeof campaignFormSchema>

/* <----- Get Campaigns Types [Start] -----> */
export interface ICampaignSort {
  campaignName?: boolean | null;
  createdBy?: boolean | null;
  status?: boolean | null;
  endDate?: boolean | null;
  amountRequsted?: boolean | null;
  knownDuration?: boolean | null;
  campaignDuration?: boolean | null;
  type?: boolean | null;
  amountRaised?: boolean | null;
  createdAt?: boolean | null;
}

export interface ICampaignRequest {
  searchText?: string | null;
  sortBy?: ICampaignSort | null;
  ansarName?: string | null;
  knownDuration?: string | null;
  endDate?: string | null;
  amountRequested?: string | number | null;
  campaignDuration?: string | number | null;
  amountRaised?: string | number | null;
  status?: CampaignStatus[] | null;
  type?: CampaignType[] | null;
  createdAt?: {
    startDate?: string | null;
    endDate?: string | null;
  } | null;
  pageSize?: number;
  page?: number;
}

export interface ICampaignResponse {
  campaigns: ICampaign[];
  total: string | number;
}

export interface ICampaign {
  id: string;
  title: string;
  type: CampaignType;
  endDate: string;
  duration: number;
  familiarDuration: string;
  totalAmount: number;
  amountRaised: number;
  description: string;
  paymentDetails: string;
  isActive: boolean;
  isDeleted: boolean;
  totalReports: number;
  status: CampaignStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByUserName?: string | null;
  image?: {
    id: string;
    url: string;
    name: string;
  };
}

/* <----- Get Campaigns Types [End] -----> */


/* <----- Create/Update Campaign Types [Start] -----> */

export interface ICreateCampaignRequest {
  campaignId?: string;
  title: string;
  type: CampaignType;
  familiarDuration?: string | null;
  duration: string; // in days
  amount: string;
  description: string;
  paymentDetails?: string | null;
  newUsers?: {
    phone: string;
  }[];
  image?: File;
}

/* <----- Create/Update Campaign Types [End] -----> */


/* <----- Update Campaign Status Types [Start] -----> */

export interface IUpdateCampaignStatusRequest {
  campaignId: string;
  status: CampaignStatus;
}