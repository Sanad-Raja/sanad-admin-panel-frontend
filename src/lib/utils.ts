import { CampaignStatus } from "@/types/campaign.types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { phone } from "phone"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusColors = (status: CampaignStatus) => {
  switch (status) {
    case CampaignStatus.yetToApprove:
      return "bg-yellow-500 hover:bg-yellow-600";
    case CampaignStatus.approved:
      return "bg-green-500 hover:bg-green-600";
    case CampaignStatus.yetToDisburse:
      return "bg-blue-500 hover:bg-blue-600";
    case CampaignStatus.disbursed:
      return "bg-purple-500 hover:bg-purple-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

export const validatePhone = (phoneNumber: string): string | null => {
    const metaData = phone(phoneNumber)
    return metaData.isValid ? metaData.phoneNumber : null
}
