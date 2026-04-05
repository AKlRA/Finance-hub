import { User } from "./user.model";
 
export interface Enquiry {
    status?: any;
    enquiryId?:number;
    message:string;
    user?:User;
}
 
