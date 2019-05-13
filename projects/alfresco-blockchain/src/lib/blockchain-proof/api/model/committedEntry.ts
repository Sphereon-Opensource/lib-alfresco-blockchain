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


/**
 * Commited Entry
 */
export interface CommittedEntry {
    /**
     * The registration time of the entry. Only when registration has occurred ofcourse
     */
    registrationTime?: Date;
    /**
     * Chain Id
     */
    chainId?: string;
    /**
     * The context
     */
    context?: string;
    /**
     * The registration state of the entry
     */
    registrationState: CommittedEntry.RegistrationStateEnum;
    /**
     * This is the signature state.
     */
    signatureState?: CommittedEntry.SignatureStateEnum;
    /**
     * This is a message describing the signature state.
     */
    signatureStateMessage?: string;
    /**
     * The entry Id for the registration
     */
    entryId: string;
}
export namespace CommittedEntry {
    export type RegistrationStateEnum = 'NOT_REGISTERED' | 'PENDING' | 'REGISTERED';
    export const RegistrationStateEnum = {
        NOTREGISTERED: 'NOT_REGISTERED' as RegistrationStateEnum,
        PENDING: 'PENDING' as RegistrationStateEnum,
        REGISTERED: 'REGISTERED' as RegistrationStateEnum
    }
    export type SignatureStateEnum = 'NOT_FOUND' | 'UNSIGNED' | 'INVALID' | 'VERIFIED';
    export const SignatureStateEnum = {
        NOTFOUND: 'NOT_FOUND' as SignatureStateEnum,
        UNSIGNED: 'UNSIGNED' as SignatureStateEnum,
        INVALID: 'INVALID' as SignatureStateEnum,
        VERIFIED: 'VERIFIED' as SignatureStateEnum
    }
}
