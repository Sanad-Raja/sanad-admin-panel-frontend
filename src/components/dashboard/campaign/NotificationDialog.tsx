import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { sendCampaignNotification } from "@/helpers/apis/campaigns";
import queryClient from "@/helpers/query.config";
import { QUERY_KEY } from "@/lib/constans";
import { notificationSchema, type NotificationField } from "@/types/ansars.types";
import { type ICampaign } from "@/types/campaign.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LucideBell, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface NotificationDialogProps {
    data?: ICampaign;
    visible: boolean;
    setVisible: (value: boolean) => void;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
    data,
    visible,
    setVisible,
}) => {

    const form = useForm<NotificationField>({
        defaultValues: {
            message: "",
        },
        resolver: zodResolver(notificationSchema),
    });

    const sendNotificationMutation = useMutation({
        mutationFn: async (dialogData: NotificationField) =>
            sendCampaignNotification(data?.id || "", dialogData.message),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.SEND_NOTIFICATION],
            });
            toast.success("Notification sent successfully");
            setVisible(false);
            form.reset();
        },
        onError: (error) => {
            console.error("Error creating campaign:", error);
        },
    });

    const onSubmit = (data: NotificationField) => {
        try {
            sendNotificationMutation.mutate(data);
        } catch (error) {
            console.error("Error creating campaign:", error);
        }
    };
    return (
        <Dialog
            open={visible}
            onOpenChange={setVisible}
        >
            <DialogContent className="md:!max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LucideBell className="h-5 w-5" />
                        Send Message
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {data && (
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <span className="text-sm text-muted-foreground">
                                    Campaign:
                                </span>
                                <div className="flex items-center gap-2 max-w-sm overflow-auto">
                                    <Badge
                                        variant="secondary"
                                        className="bg-gray-100"
                                    >
                                        {data?.title}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Type your message here..."
                                            className="h-[200px] resize-none "
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={sendNotificationMutation.isPending}
                                onClick={() => {
                                    setVisible(false)
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={sendNotificationMutation.isPending}
                            >
                                {sendNotificationMutation.isPending ? (
                                    <>Sending...</>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}

export default NotificationDialog