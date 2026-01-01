
export interface ICampaignSettings {
    id: string;
    amountLimit: number;
    isAllowUnknownPerson: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateCampaignSettingsRequest {
    amountLimit: number;
    isAllowUnknownPerson: boolean;
}

export interface IUpdateCampaignSettingsRequest {
    amountLimit?: number;
    isAllowUnknownPerson?: boolean;
}
