
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createCampaignSettings, getCampaignSettings, updateCampaignSettings } from "@/helpers/apis/campaignSettings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface CampaignSettingsDialogProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

const CampaignSettingsDialog: React.FC<CampaignSettingsDialogProps> = ({
    visible,
    setVisible,
}) => {
    const queryClient = useQueryClient();
    const [amountLimit, setAmountLimit] = useState<string>("");
    const [isAllowUnknownPerson, setIsAllowUnknownPerson] = useState<boolean>(false);
    const [exists, setExists] = useState<boolean>(false);

    // Fetch Settings
    const { data: settings, isLoading: isFetching } = useQuery({
        queryKey: ["campaign-settings"],
        queryFn: getCampaignSettings,
        enabled: visible,
    });

    useEffect(() => {
        if (settings?.data) {
            // Handle both array and single object response
            const data = Array.isArray(settings.data) ? settings.data[0] : settings.data;

            if (data) {
                setAmountLimit(data.amountLimit.toString());
                setIsAllowUnknownPerson(data.isAllowUnknownPerson);
                setExists(true);
            } else {
                setExists(false);
            }
        }
    }, [settings]);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createCampaignSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaign-settings"] });
            toast.success("Campaign settings created successfully");
            setVisible(false);
        },
        onError: (error) => {
            console.error("Error creating settings:", error);
            toast.error("Failed to create campaign settings");
        },
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: updateCampaignSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaign-settings"] });
            toast.success("Campaign settings updated successfully");
            setVisible(false);
        },
        onError: (error) => {
            console.error("Error updating settings:", error);
            toast.error("Failed to update campaign settings");
        },
    });

    const handleSave = () => {
        if (!amountLimit) {
            toast.error("Please enter an amount limit");
            return;
        }

        const payload = {
            amountLimit: Number(amountLimit),
            isAllowUnknownPerson,
        };

        if (exists) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={visible} onOpenChange={setVisible}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Campaign Settings</DialogTitle>
                    <DialogDescription>
                        Manage global settings for campaigns.
                    </DialogDescription>
                </DialogHeader>
                {isFetching ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="amountLimit" className="text-right pt-2">
                                Amount Limit
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="amountLimit"
                                    type="number"
                                    value={amountLimit}
                                    onChange={(e) => setAmountLimit(e.target.value)}
                                    placeholder="e.g. 5000"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Set the maximum amount allowed for a campaign.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="allowUnknown" className="text-right pt-2">
                                Allow Unknown
                            </Label>
                            <div className="col-span-3">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="allowUnknown"
                                        checked={isAllowUnknownPerson}
                                        onCheckedChange={setIsAllowUnknownPerson}
                                    />
                                    <Label htmlFor="allowUnknown">
                                        {isAllowUnknownPerson ? "Enabled" : "Disabled"}
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Allow users to select "I don't know them personally" as familiar duration.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setVisible(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CampaignSettingsDialog;
