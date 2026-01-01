import { LogOut, Plus, Search, Settings } from "lucide-react";
import { useState } from "react";

import Ansars from "@/components/dashboard/ansars/Ansars";
import SendNotification from "@/components/dashboard/ansars/SendNotification";
import Campaigns from "@/components/dashboard/campaign/Campaigns";
import CampaignSettingsDialog from "@/components/dashboard/campaign/CampaignSettingsDialog";
import CreateCampaignForm from "@/components/dashboard/campaign/CreateCampaignForm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDebounce from "@/hooks/useDebounce";
import {
    campaignStatusOptions,
    campaignTypeOptions,
    countries,
} from "@/lib/constans";
import type { IAnsar } from "@/types/ansars.types";
import { durationOptions } from "@/types/campaign.types";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/")({
    component: App,
    loader: async () => {
        if (!localStorage.getItem("token")) {
            return redirect({
                to: "/auth",
            });
        }
    },
});

function App() {
    const navigate = useNavigate();

    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<"campaigns" | "ansars">(
        "campaigns"
    );

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [rangeDate, setRangeDate] = useState<{ from: Date; to: Date }>({
        from: dayjs().subtract(1, "year").toDate(),
        to: dayjs().toDate(),
    });

    // Campaign Filters
    const [searchAnsar, setSearchAnsar] = useState<string>("");
    const debouncedSearchAnsar = useDebounce(searchAnsar, 500);
    const [knownDuration, setKnownDuration] = useState<string>("");
    const [amountRequested, setAmountRequested] = useState("");
    const debouncedAmountRequested = useDebounce(amountRequested, 500);
    const [amountRaised, setAmountRaised] = useState("");
    const debouncedAmountRaised = useDebounce(amountRaised, 500);
    const [campaignDuration, setCampaignDuration] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [campaignType, setCampaignType] = useState<string>("");

    // Ansar Filters
    const [blockStatus, setBlockStatus] = useState<string>("");
    const [countryCode, setCountryCode] = useState<string>("");
    const [invitedUserCount, setInvitedUserCount] = useState<string>("");
    const debouncedInvitedUserCount = useDebounce(invitedUserCount, 500);
    const [campaignCreatedCount, setCampaignCreatedCount] =
        useState<string>("");
    const debouncedCampaignCreatedCount = useDebounce(
        campaignCreatedCount,
        500
    );
    const [campaignDonatedCount, setCampaignDonatedCount] =
        useState<string>("");
    const debouncedCampaignDonatedCount = useDebounce(
        campaignDonatedCount,
        500
    );
    const [campaignSharedCount, setCampaignSharedCount] = useState<string>("");
    const debouncedCampaignSharedCount = useDebounce(campaignSharedCount, 500);
    const [sendNotificationDialogOpen, setSendNotificationDialogOpen] =
        useState(false);
    const [selectedUsers, setSelectedUsers] = useState<IAnsar[]>([]);

    // Create Campaign
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

    // useEffect(() => {
    //     if (activeTab === "campaigns") {
    //         setSearchQuery("");
    //     }
    // }, [activeTab]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <Card className="gap-0">
                    <CardHeader className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-3xl font-bold">
                                Dashboard
                            </CardTitle>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Input
                                    type="date"
                                    className="block"
                                    value={
                                        rangeDate?.from
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) => {
                                        const newFromDate = new Date(
                                            e.target.value
                                        );
                                        if (newFromDate > rangeDate?.to) {
                                            setRangeDate({
                                                from: newFromDate,
                                                to: newFromDate,
                                            });
                                        } else {
                                            setRangeDate({
                                                from: newFromDate,
                                                to: rangeDate?.to,
                                            });
                                        }
                                    }}
                                    max={new Date().toISOString().split("T")[0]}
                                />

                                <Input
                                    type="date"
                                    className="block"
                                    value={
                                        rangeDate?.to
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setRangeDate({
                                            from: rangeDate?.from || new Date(),
                                            to: new Date(e.target.value),
                                        })
                                    }
                                    min={
                                        rangeDate?.from
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    max={new Date().toISOString().split("T")[0]}
                                />

                                <Button
                                    onClick={() => setLogoutDialogOpen(true)}
                                    variant="outline"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Log Out
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <Tabs
                        className="px-4 h-[calc(100vh-160px)] gap-0"
                        value={activeTab}
                        onValueChange={(tab: string) =>
                            setActiveTab(tab as "campaigns" | "ansars")
                        }
                    >
                        <div className="flex items-center justify-between">
                            <TabsList className="grid grid-cols-3 sm:inline-flex">
                                <TabsTrigger value="campaigns">
                                    Campaigns
                                </TabsTrigger>
                                <TabsTrigger value="ansars">Ansars</TabsTrigger>
                            </TabsList>
                            <div className="flex gap-2">
                                {activeTab !== "ansars" && (
                                    <>
                                        <Button
                                            onClick={() => setSettingsDialogOpen(true)}
                                            className="whitespace-nowrap"
                                            variant={"outline"}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                {
                                                    activeTab === "campaigns"
                                                        ? setCreateDialogOpen(true)
                                                        : setCreateDialogOpen(
                                                            false
                                                        );
                                                }
                                            }}
                                            className="whitespace-nowrap"
                                            variant={"outline"}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New
                                        </Button>
                                    </>
                                )}

                                {/* Send Multiple Notification */}
                                {activeTab === "ansars" &&
                                    selectedUsers.length > 0 && (
                                        <Button
                                            onClick={() => {
                                                setSendNotificationDialogOpen(
                                                    true
                                                );
                                            }}
                                            className="whitespace-nowrap"
                                            variant={"outline"}
                                        >
                                            Send Notification
                                        </Button>
                                    )}

                                {/* Campaign Filters Clear */}
                                {activeTab === "campaigns" && (
                                    <Button
                                        onClick={() => {
                                            setRangeDate({
                                                from: dayjs()
                                                    .subtract(1, "year")
                                                    .toDate(),
                                                to: dayjs().toDate(),
                                            });
                                            setSearchQuery("");
                                            setSearchAnsar("");
                                            setKnownDuration("");
                                            setAmountRequested("");
                                            setAmountRaised("");
                                            setCampaignDuration("");
                                            setStatus("");
                                            setCampaignType("");
                                        }}
                                        className="whitespace-nowrap"
                                    >
                                        Clear Filters
                                    </Button>
                                )}

                                {/* Ansar Filters Clear */}
                                {activeTab === "ansars" && (
                                    <Button
                                        onClick={() => {
                                            setRangeDate({
                                                from: dayjs()
                                                    .subtract(1, "year")
                                                    .toDate(),
                                                to: dayjs().toDate(),
                                            });
                                            setSearchQuery("");
                                            setBlockStatus("");
                                            setCountryCode("");
                                            setInvitedUserCount("");
                                            setCampaignCreatedCount("");
                                            setInvitedUserCount("");
                                            setCampaignSharedCount("");
                                        }}
                                        className="whitespace-nowrap"
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 justify-between py-4">
                            <div
                                className={`relative ${activeTab === "campaigns" ? "w-[170px]" : "w-[220px]"}`}
                            >
                                <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder={
                                        activeTab === "campaigns"
                                            ? "Search campaigns..."
                                            : activeTab === "ansars"
                                                ? "Search ansars, campaigns..."
                                                : "Search"
                                    }
                                    className="pl-8 w-full"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            {activeTab === "campaigns" && (
                                <div className="flex flex-wrap gap-2  justify-between w-[calc(100%-170px)]">
                                    <div className="flex flex-wrap gap-2">
                                        <div className="relative w-[135px]">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Search ansar..."
                                                value={searchAnsar}
                                                onChange={(e) =>
                                                    setSearchAnsar(
                                                        e.target.value
                                                    )
                                                }
                                                className="pl-8 w-full"
                                            />
                                        </div>
                                        <Select
                                            value={knownDuration}
                                            onValueChange={(e) =>
                                                setKnownDuration(e)
                                            }
                                        >
                                            <SelectTrigger className="w-[135px]">
                                                <SelectValue placeholder="Known Duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Known Durations
                                                </SelectItem>
                                                {durationOptions.map(
                                                    (duration) => (
                                                        <SelectItem
                                                            key={duration}
                                                            value={duration}
                                                        >
                                                            {duration}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Amount Requested"
                                                className="w-[165px] pl-8"
                                                value={amountRequested}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9.]/g,
                                                            ""
                                                        );
                                                    // Ensure the value is a valid number
                                                    if (!isNaN(Number(value))) {
                                                        setAmountRequested(
                                                            value
                                                        );
                                                    } else {
                                                        setAmountRequested("");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Amount Raised"
                                                className="w-[140px] pl-8"
                                                value={amountRaised}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9.]/g,
                                                            ""
                                                        );
                                                    // Ensure the value is a valid number
                                                    if (!isNaN(Number(value))) {
                                                        setAmountRaised(value);
                                                    } else {
                                                        setAmountRaised("");
                                                    }
                                                }}
                                            />
                                        </div>

                                        <Select
                                            value={campaignDuration}
                                            onValueChange={(e) =>
                                                setCampaignDuration(e)
                                            }
                                        >
                                            <SelectTrigger className="w-[135px]">
                                                <SelectValue placeholder="Campaign Duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Campaign Durations
                                                </SelectItem>
                                                {["3", "7", "10"].map(
                                                    (duration) => (
                                                        <SelectItem
                                                            key={duration}
                                                            value={duration}
                                                        >
                                                            {duration} Days
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={status}
                                            onValueChange={(e) => setStatus(e)}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Status
                                                </SelectItem>
                                                {campaignStatusOptions.map(
                                                    (status) => (
                                                        <SelectItem
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            {status.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={campaignType}
                                            onValueChange={(e) => {
                                                setCampaignType(e);
                                            }}
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Campaign Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Types
                                                </SelectItem>
                                                {campaignTypeOptions.map(
                                                    (type, index) => (
                                                        <SelectItem
                                                            key={index}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {activeTab === "ansars" && (
                                <div className="flex flex-wrap gap-2  justify-between w-[calc(100%-220px)]">
                                    <div className="flex flex-wrap gap-2">
                                        <Select
                                            value={blockStatus}
                                            onValueChange={(e) =>
                                                setBlockStatus(e)
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Status
                                                </SelectItem>
                                                {[
                                                    {
                                                        value: "BLOCKED",
                                                        label: "Blocked",
                                                    },
                                                    {
                                                        value: "UNBLOCKED",
                                                        label: "Unblocked",
                                                    },
                                                ].map((status) => (
                                                    <SelectItem
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={countryCode}
                                            onValueChange={(e) =>
                                                setCountryCode(e)
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Country
                                                </SelectItem>
                                                {countries.map((country) => (
                                                    <SelectItem
                                                        key={country.value}
                                                        value={country.value}
                                                    >
                                                        {country.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Invited User Count"
                                                className="w-[160px] pl-8"
                                                value={invitedUserCount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ""
                                                        );
                                                    // Ensure the value is a valid number
                                                    if (!isNaN(Number(value))) {
                                                        setInvitedUserCount(
                                                            value
                                                        );
                                                    } else {
                                                        setInvitedUserCount("");
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Campaign Created Count"
                                                className="w-[200px] pl-8"
                                                value={campaignCreatedCount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ""
                                                        );
                                                    // Ensure the value is a valid number
                                                    if (!isNaN(Number(value))) {
                                                        setCampaignCreatedCount(
                                                            value
                                                        );
                                                    } else {
                                                        setCampaignCreatedCount(
                                                            ""
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Campaign Donated Count"
                                                className="w-[170px] pl-8"
                                                value={campaignDonatedCount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ""
                                                        );
                                                    // Ensure the value is a valid number
                                                    if (!isNaN(Number(value))) {
                                                        setCampaignDonatedCount(
                                                            value
                                                        );
                                                    } else {
                                                        setCampaignDonatedCount(
                                                            ""
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Campaign Shared Count"
                                                className="w-[200px] pl-8"
                                                value={campaignSharedCount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ""
                                                        );
                                                    // Ensure the value is a valid number
                                                    if (!isNaN(Number(value))) {
                                                        setCampaignSharedCount(
                                                            value
                                                        );
                                                    } else {
                                                        setCampaignSharedCount(
                                                            ""
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <TabsContent
                            className="flex flex-col justify-between h-[calc(100%-100px)]"
                            value="campaigns"
                        >
                            <Campaigns
                                setSearchQuery={setSearchQuery}
                                setActiveTab={setActiveTab}
                                rangeDate={rangeDate ?? null}
                                searchQuery={debouncedSearch}
                                searchAnsar={debouncedSearchAnsar}
                                searchKnownDuration={
                                    knownDuration === "all" ? "" : knownDuration
                                }
                                searchAmountRequested={debouncedAmountRequested}
                                searchAmountRaised={debouncedAmountRaised}
                                searchDuration={
                                    campaignDuration === "all"
                                        ? ""
                                        : campaignDuration
                                }
                                searchStatus={status}
                                searchType={campaignType}
                            />
                        </TabsContent>

                        <TabsContent
                            className="flex flex-col justify-between h-[calc(100%-100px)]"
                            value="ansars"
                        >
                            <Ansars
                                setSearchQuery={setSearchQuery}
                                setActiveTab={setActiveTab}
                                rangeDate={rangeDate ?? null}
                                searchQuery={debouncedSearch}
                                status={
                                    blockStatus === "all" || blockStatus === ""
                                        ? null
                                        : blockStatus === "BLOCKED"
                                            ? true
                                            : false
                                }
                                selectedRows={selectedUsers}
                                setSelectedRows={setSelectedUsers}
                                countryCode={
                                    countryCode === "all" ? "" : countryCode
                                }
                                invitedUserCount={
                                    debouncedInvitedUserCount
                                        ? Number(debouncedInvitedUserCount)
                                        : undefined
                                }
                                campaignSharedCount={
                                    debouncedCampaignSharedCount
                                        ? Number(debouncedCampaignSharedCount)
                                        : undefined
                                }
                                campaignDonatedCount={
                                    debouncedCampaignDonatedCount
                                        ? Number(debouncedCampaignDonatedCount)
                                        : undefined
                                }
                                campaignCreatedCount={
                                    debouncedCampaignCreatedCount
                                        ? Number(debouncedCampaignCreatedCount)
                                        : undefined
                                }
                            />
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* Send Notifications */}
                {/* Send Notification Dialog */}
                {selectedUsers && (
                    <SendNotification
                        open={sendNotificationDialogOpen}
                        onOpenChange={setSendNotificationDialogOpen}
                        ansars={selectedUsers}
                    />
                )}

                {/* Create Campaign */}
                <CreateCampaignForm
                    visible={createDialogOpen}
                    setVisible={setCreateDialogOpen}
                />

                <CampaignSettingsDialog
                    visible={settingsDialogOpen}
                    setVisible={setSettingsDialogOpen}
                />

                {/* Log Out Confirmation Dialog */}
                <Dialog
                    open={logoutDialogOpen}
                    onOpenChange={setLogoutDialogOpen}
                >
                    <DialogContent className="md:!max-w-md">
                        <DialogHeader>
                            <DialogTitle>Log Out</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to log out?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setLogoutDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    navigate({
                                        to: "/auth",
                                    });
                                }}
                            >
                                Log Out
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
