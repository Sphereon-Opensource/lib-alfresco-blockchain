/**
 * Triall Agent for Alfresco API's
 * This is an API containing functions for blockchain integration with Alfresco.  
 *
 * OpenAPI spec version: 0.1
 * Contact: dev@sphereon.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { UserProfile } from './userProfile';


export interface FileSignatoriesDTO {
    isSigned?: boolean;
    revisionDate?: Date;
    signatoriesOrder?: number;
    isProcessed?: boolean;
    userProfile?: UserProfile;
}
