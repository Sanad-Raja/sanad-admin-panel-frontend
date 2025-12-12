import { useState } from "react";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { verifyOtpSchema, type VerifyOtpField } from "@/types/auth.types";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { loginUser } from "@/helpers/apis/login";

export const Route = createFileRoute("/auth/verifyotp")({
    component: RouteComponent,
});

function RouteComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { phone } = useSearch({ from: "/auth/verifyotp" }) as {
        phone: string;
    };

    const form = useForm<VerifyOtpField>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            phone: phone || "",
            otp: "",
        },
    });

    const onSubmit = async (values: VerifyOtpField) => {
        setIsLoading(true);
        try {
            const response = await loginUser({
                phone: `+${values.phone}`,
                verificationCode: values.otp,
            });
            if (response) {
                router.navigate({ to: "/" });
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
                    Please enter the OTP that was sent to your number
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
                                            {...field}
                                            disabled={true}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OTP</FormLabel>
                                    <FormControl>
                                        <InputOTP
                                            maxLength={6}
                                            value={field.value}
                                            onChange={(value) => {
                                                const newValue = value.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                );
                                                field.onChange(newValue);
                                            }}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
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
                            {isLoading ? "Verifying..." : "Submit"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
