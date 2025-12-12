import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { sendNotification } from "@/helpers/apis/ansars";
import queryClient from "@/helpers/query.config";
import { QUERY_KEY } from "@/lib/constans";
import {
    notificationSchema,
    type IAnsar,
    type NotificationField,
} from "@/types/ansars.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LucideBell, Send } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface SendNotificationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ansars: IAnsar[] | null;
}

const SendNotification: React.FC<SendNotificationProps> = ({
    open,
    onOpenChange,
    ansars,
}) => {
    const form = useForm<NotificationField>({
        defaultValues: {
            message: "",
        },
        resolver: zodResolver(notificationSchema),
    });

    const sendNotificationMutation = useMutation({
        mutationFn: async (data: NotificationField) =>
            sendNotification(ansars?.map((ansar) => ansar.user.id) ||[], data.message),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.SEND_NOTIFICATION],
            });
            toast.success("Notification sent successfully");
            onOpenChange(false);
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
            open={open}
            onOpenChange={onOpenChange}
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
                        { ansars && ansars?.length > 0 && (
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <span className="text-sm text-muted-foreground">
                                    To:
                                </span>
                                <div className="flex items-center gap-2 max-w-sm overflow-auto">
                                {ansars.map((ansar) => 
                                <Badge
                                    variant="secondary"
                                    className="bg-gray-100"
                                >
                                    {ansar.user.phone}
                                </Badge>
                            )}
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
                                onClick={() => onOpenChange(false)}
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
        </Dialog>
    );
};

export default SendNotification;
