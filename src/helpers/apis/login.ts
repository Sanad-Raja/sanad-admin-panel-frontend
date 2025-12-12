import type { ApiResponse } from "@/types/apiResponse";
import { ApiPost } from "../api-helper";


/* <----- Send OTP -----> */
export const sendOtp = async ({ phone }: { phone: string }) => {
    try {
        const result = await ApiPost(
            "/admin/send-otp",
            { phone },
            {}, false
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


/* <----- Login -----> */
export const loginUser = async ({ phone, verificationCode }: { phone: string, verificationCode: string }) => {
    try {
        const result = await ApiPost<ApiResponse<{ accessToken: string }>>(
            "/admin/login",
            { phone, verificationCode },
            {}, false
        );
        localStorage.setItem("token", result.data.accessToken);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};