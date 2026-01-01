import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ImageCropper } from "@/components/image-cropper/ImageCropper";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCampaign, updateCampaign } from "@/helpers/apis/campaigns";
import queryClient from "@/helpers/query.config";
import { campaignTypeOptions, QUERY_KEY } from "@/lib/constans";
import { validatePhone } from "@/lib/utils";
import {
    CampaignType,
    durationOptions,
    getCampaignFormSchema,
    type CampaignFormField,
    type ICampaign
} from "@/types/campaign.types";
import { useMutation } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { toast } from "react-toastify";

interface CreateCampaignFormProps {
    data?: ICampaign;
    visible: boolean;
    setVisible: (value: boolean) => void;
}

import { getCampaignSettings } from "@/helpers/apis/campaignSettings";
import { useQuery } from "@tanstack/react-query";

const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({
    data,
    visible,
    setVisible,
}) => {
    const router = useRouter();

    const [amountLimit, setAmountLimit] = useState<number>(0);

    const { data: settings } = useQuery({
        queryKey: ["campaign-settings"],
        queryFn: getCampaignSettings,
        enabled: visible,
    });

    useEffect(() => {
        if (settings?.data) {
            const data = Array.isArray(settings.data) ? settings.data[0] : settings.data;
            if (data?.amountLimit) {
                setAmountLimit(data.amountLimit);
            }
        }
    }, [settings]);

    const form = useForm<CampaignFormField>({
        defaultValues: {
            name: "",
            campaignType: CampaignType.zakat,
            knownDuration: "3 Months to 6 Months",
            campaignDuration: "",
            amount: "",
            description: "",
            newUsers: [],
        },
        mode: "onChange",
        resolver: zodResolver(getCampaignFormSchema(amountLimit || 999)),
    });
    const [userPhone, setUserPhone] = useState<string>("");

    const createCampaignMutation = useMutation({
        mutationFn: async (data: FormData) =>
            createCampaign(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GET_CAMPAIGNS],
            });
            toast.success("Campaign created successfully");
            setVisible(false);
            router.navigate({ to: "/" });
            form.reset();
        },
        onError: (error) => {
            console.error("Error creating campaign:", error);
        },
    });

    const updateCampaignMutation = useMutation({
        mutationFn: async (data: FormData) =>
            updateCampaign(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GET_CAMPAIGNS],
            });
            toast.success("Campaign updated successfully");
            setVisible(false);
            router.navigate({ to: "/" });
            form.reset();
        },
        onError: (error) => {
            console.error("Error updating campaign:", error);
        },
    });

    const onSubmit = async (data: CampaignFormField) => {
        try {
            const formData = new FormData();

            // Add all form fields to FormData - ensure all values are strings
            formData.append('title', data.name || '');
            formData.append('type', data.campaignType || '');
            formData.append('familiarDuration', data.knownDuration || '');
            formData.append('duration', data.campaignDuration || '');
            formData.append('amount', data.amount || '');
            formData.append('description', data.description || '');

            // Handle newUsers array - always append, even if empty
            if (data.newUsers && data.newUsers.length > 0) {
                data.newUsers.forEach((user, index) => {
                    formData.append(`newUsers[${index}][phone]`, user.phone || '');
                });
            } else {
                // Append empty array indicator if no users
                formData.append('newUsers', '[]');
            }

            // Handle image - always append something
            const imageValue = data.image;
            if (imageValue instanceof File) {
                formData.append("image", imageValue);
            } else {
                // Append empty string or null for image if no file
                formData.append("image", "");
            }

            // Handle update vs create
            if (data.id) {
                formData.append('campaignId', data.id);
                updateCampaignMutation.mutate(formData);
            } else {
                createCampaignMutation.mutate(formData);
            }
        } catch (error) {
            console.error("Error creating/updating campaign:", error);
            toast.error("Failed to process form data");
        }
    };


    const handleCancel = () => {
        setVisible(false);
        form.reset();
        router.navigate({ to: "/" });
    };

    useEffect(() => {
        if (data) {
            form.setValue("id", data.id);
            form.setValue("name", data.title);
            form.setValue("campaignType", data.type);
            form.setValue("knownDuration", data.familiarDuration);
            form.setValue("campaignDuration", data.duration.toString() || "");
            form.setValue("amount", data.totalAmount.toString() || "");
            form.setValue("description", data.description);
            form.setValue("image",
                data.image && 'id' in data.image && data.image.id
                    ? data.image
                    : null as any
            );
        }
    }, [data, form]);

    return (
        <Dialog
            open={visible}
            onOpenChange={setVisible}
        >
            <DialogContent>
                <DialogHeader className="flex items-center justify-center pt-2 pb-4 ">
                    <DialogTitle className="text-3xl font-medium">
                        {data ? "Edit" : "Create"} a campaign
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-scroll">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-normal">
                                            Title of the campaign
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Title"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="campaignType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-normal">
                                            Campaign Type
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select campaign type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {campaignTypeOptions.map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="knownDuration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-normal">
                                            How Long Have You Known This Person
                                            / Family Personally?
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Duration known" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="campaignDuration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-normal">
                                            Duration of the campaign (in days)
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Campaign duration" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-full">
                                        <FormLabel className="font-normal">
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Comments"
                                                className="!h-32 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-normal">
                                            Amount needed
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={`Max $ ${amountLimit || 999}`}
                                                value={field.value}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(
                                                        /[^0-9.]/g,
                                                        ""
                                                    );
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => {
                                    const watchedImage = form.watch("image");
                                    const previewImgUrl = watchedImage
                                        ? watchedImage instanceof File
                                            ? URL.createObjectURL(watchedImage)
                                            : watchedImage.url
                                        : undefined;

                                    return (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <ImageCropper
                                                    variant="custom"
                                                    defaultRatio="16:9"
                                                    availableRatios={["16:9"]}
                                                    previewImgUrl={previewImgUrl}
                                                    customInput={(
                                                        <label
                                                            htmlFor="image-upload"
                                                            className="aspect-square h-20 bg-transparent cursor-pointer group relative flex items-center justify-center"
                                                        >
                                                            <div className="flex bg-background flex-col h-full justify-center rounded-2xl w-full items-center">
                                                                <Upload className="size-8" />
                                                            </div>
                                                        </label>
                                                    )}
                                                    onImageCropped={(croppedImage) => {
                                                        field.onChange(croppedImage); // Use field.onChange instead of setValue
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                        </div>

                        {/* add multiple phone number after click add button show me bottom */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <FormField
                                control={form.control}
                                name="newUsers"
                                render={() => (
                                    <FormItem className="flex flex-col h-full">
                                        <FormLabel className="font-normal">
                                            New Users
                                        </FormLabel>
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <Input
                                                    placeholder="+1403XXXXXXX"
                                                    value={userPhone}
                                                    onChange={(event) => {
                                                        const newValue =
                                                            event.target.value.replace(
                                                                /[^0-9+]/g,
                                                                ""
                                                            );
                                                        if (
                                                            !newValue.startsWith(
                                                                "+"
                                                            )
                                                        ) {
                                                            setUserPhone(
                                                                "+" + newValue
                                                            );
                                                        } else {
                                                            setUserPhone(
                                                                newValue
                                                            );
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            if (
                                                                userPhone.trim() ===
                                                                ""
                                                            )
                                                                return;
                                                            if (
                                                                validatePhone(
                                                                    userPhone
                                                                )
                                                            ) {
                                                                form.setValue(
                                                                    "newUsers",
                                                                    [
                                                                        ...(form.watch(
                                                                            "newUsers"
                                                                        ) ??
                                                                            []),
                                                                        {
                                                                            phone: userPhone,
                                                                        },
                                                                    ]
                                                                );
                                                            } else {
                                                                toast.error(
                                                                    "Invalid phone number"
                                                                );
                                                            }
                                                            setUserPhone("");
                                                        }
                                                    }}
                                                    maxLength={20}
                                                />
                                            </FormControl>
                                            <Button
                                                className="h-9 text-sm items-center"
                                                type="button"
                                                onClick={() => {
                                                    if (userPhone.trim() === "")
                                                        return;
                                                    if (
                                                        validatePhone(userPhone)
                                                    ) {
                                                        form.setValue(
                                                            "newUsers",
                                                            [
                                                                ...(form.watch(
                                                                    "newUsers"
                                                                ) ?? []),
                                                                {
                                                                    phone: userPhone,
                                                                },
                                                            ]
                                                        );
                                                    } else {
                                                        toast.error(
                                                            "Invalid phone number"
                                                        );
                                                    }
                                                    setUserPhone("");
                                                }}
                                            >
                                                + Add
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-wrap gap-2 mt-5">
                                {form.watch("newUsers") &&
                                    form
                                        .watch("newUsers")
                                        ?.map(
                                            (
                                                { phone: user },
                                                index: number
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground flex items-center gap-1"
                                                >
                                                    {user}
                                                    <X
                                                        className="w-3 h-3 cursor-pointer shrink-0 bg-primary rounded-full text-white"
                                                        onClick={() => {
                                                            form.setValue(
                                                                "newUsers",
                                                                form
                                                                    .watch(
                                                                        "newUsers"
                                                                    )
                                                                    ?.filter(
                                                                        (u) =>
                                                                            u.phone !==
                                                                            user
                                                                    )
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )
                                        )}
                            </div>
                        </div>

                        <DialogFooter>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                                >
                                    {createCampaignMutation.isPending || updateCampaignMutation.isPending
                                        ? "Loading..."
                                        : data
                                            ? "Update"
                                            : "Create"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCampaignForm;
