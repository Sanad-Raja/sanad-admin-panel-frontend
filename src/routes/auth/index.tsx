import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { sendOtp } from "@/helpers/apis/login";
import { loginSchema, type LoginField } from "@/types/auth.types";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/auth/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<LoginField>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            phone: "",
        },
    });

    const onSubmit = async (values: LoginField) => {
        setIsLoading(true);
        try {
            const response = await sendOtp({ phone: `+${values.phone}` });
            if (response) {
                router.navigate({
                    to: "/auth/verifyotp",
                    search: { phone: values.phone },
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                    Enter your phone number to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+1234567890"
                                            value={field.value}
                                            onChange={(event) => {
                                                const newValue =
                                                    event.target.value.replace(
                                                        /[^0-9+]/g,
                                                        ""
                                                    );
                                                if (newValue.startsWith("+")) {
                                                    field.onChange(newValue);
                                                } else {
                                                    field.onChange(
                                                        "+" + newValue
                                                    );
                                                }
                                            }}
                                            maxLength={20}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send OTP"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
