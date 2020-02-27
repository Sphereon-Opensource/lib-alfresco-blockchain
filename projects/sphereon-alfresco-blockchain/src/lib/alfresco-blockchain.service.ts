import {NodesApiService, NotificationService, TranslationService} from '@alfresco/adf-core';
import {DatePipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {forkJoin, identity, Observable, of, throwError} from 'rxjs';
import {MinimalNodeEntity, MinimalNodeEntryEntity} from 'alfresco-js-api';
import {Configuration} from './configuration';
import {RegistrationState} from './registration-state';
import {catchError, map} from 'rxjs/operators';
import {BlockchainAgentService} from './blockchain-agent.service';
import {VerifyNodesResponse} from "./model/verifyNodesResponse";
import {VerifyContentResponse} from "./model/verifyContentResponse";

const BASE_PATH = new InjectionToken<string>('basePath');

@Injectable({
    providedIn: 'root'
})
export class AlfrescoBlockchainService {
    private TIME_FORMAT = 'MMM d, y HH:mm:ss';

    private blockchainService: BlockchainAgentService;

    constructor(private nodesApiService: NodesApiService,
                private notification: NotificationService,
                private translation: TranslationService,
                private http: HttpClient,
                private datePipe: DatePipe,
                @Optional() @Inject(BASE_PATH) basePath: string) {
        this.blockchainService = new BlockchainAgentService(http, this.apiConfigFrom(basePath));
    }

    public registerSelection(contentEntities: MinimalNodeEntity[]): Observable<string[]> {
        if (!this.isEntryEntitiesArray(contentEntities)) {
            return throwError('Selected entities should only contain entries.');
        }

        const registrations: Observable<string>[] = contentEntities
            .map(entity => {
                if (!entity.entry.isFile) {
                    return of(`Entry ${entity.entry.name} is not a file.`);
                }
                const id = entity.entry.id;
                const name = entity.entry.name;
                const registrationState = entity.entry.properties['bc:RegistrationState'];
                return this.registerEntry(id, name, registrationState);
            });
        return forkJoin(registrations);
    }

    public verifyEntries(entries: MinimalNodeEntryEntity[]): Observable<string[]> {
        console.log('Verifying ' + entries.length + ' selected entries.');

        const request = {
            nodeIds: entries.map(entry => entry.id)
        };

        return this.blockchainService.verifyEntries(request)
            .pipe(
                map((verifyNodesResponse: VerifyNodesResponse) => {
                    return verifyNodesResponse.contentResponses
                        .map(verifyContentResponse => {
                            const entry = entries.find(entry => entry.id === verifyContentResponse.requestId);
                            return !entry ? null : this.buildVerifyResponseMessage(entry, verifyContentResponse);
                        })
                        .filter(identity);
                }),
                catchError(error => {
                    const userMessage = this.translation.instant('APP.MESSAGES.INFO.BLOCKCHAIN.PROCESS_FAILED', {
                        process: this.translation.instant('APP.MESSAGES.INFO.BLOCKCHAIN.VERIFICATION'),
                        message: error.error.message,
                    });
                    return throwError(userMessage);
                }));
    }

    private registerEntry(entryId: string, entryName: string, registrationState: string): Observable<string> {
        if ('Registered' === registrationState) {
            return of(`File ${entryName} is already registered, skipping.`);
        }

        console.log('Marking entry for blockchain registration' + entryId);
        const nodeBody = {
            properties: {
                'bc:RegistrationState': RegistrationState.PENDING_REGISTRATION,
                'bc:StateIcon': 'assets/images/pending-42x42.png'
            }
        };

        return this.nodesApiService.updateNode(entryId, nodeBody)
            .pipe(
                map(() => this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTRATION_STARTED', {name: entryName})),
                catchError(() => {
                    const userMessage = this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.PROCESS_FAILED', {
                        process: this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTRATION'),
                        name: entryName,
                    });
                    return throwError(userMessage);
                })
            );
    }

    private buildVerifyResponseMessage(entry, verifyContentResponse: VerifyContentResponse) {
        const [registrationState, registrationTime] = this.getRegistrationStateAndTime(verifyContentResponse);

        switch (registrationState) {
            case RegistrationState.REGISTERED:
                if (registrationTime != null) {
                    return this.translation.instant('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTERED_ON', {
                        file: entry.name,
                        time: registrationTime,
                    });
                }
                return this.translation.instant('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTERED', {file: entry.name});

            case 'NOT_REGISTERED':
            case RegistrationState.NOT_REGISTERED:
                return this.translation.instant('APP.MESSAGES.INFO.BLOCKCHAIN.NOT_REGISTERED', {
                    file: entry.name
                });

            default:
                return this.translation.instant('APP.MESSAGES.INFO.BLOCKCHAIN.PENDING', {
                    file: entry.name
                });
        }
    }

    private getRegistrationStateAndTime(verifyContentResponse: VerifyContentResponse) {
        if (verifyContentResponse.perHashProofChain != null) {
            return this.getRegistrationStateAndTimeFromChain(verifyContentResponse.perHashProofChain);
        }

        if (verifyContentResponse.singleProofChain != null) {
            return this.getRegistrationStateAndTimeFromChain(verifyContentResponse.singleProofChain);
        }

        return [null, null];
    }

    private getRegistrationStateAndTimeFromChain(chain): string[] {
        const state = chain.registrationState;
        const registrationTime = state !== 'REGISTERED' ? null : this.datePipe.transform(chain.registrationTime, this.TIME_FORMAT);
        return [
            state,
            registrationTime,
        ];
    }

    private translate(key: string, interpolateParams = {}) {
        return this.translation.instant(key, interpolateParams);
    }

    private isEntryEntitiesArray(contentEntities: any[]): boolean {
        if (!contentEntities || !contentEntities.length) {
            return false;
        }
        return !this.hasAnyNonEntryNode(contentEntities);
    }

    private hasAnyNonEntryNode(contentEntities: any[]): boolean {
        return contentEntities.find(node => (!node || !node.entry || !(node.entry.nodeId || node.entry.id)));
    }

    apiConfigFrom(basePath: string) {
        const config = new Configuration();
        config.basePath = basePath;
        return config;
    }
}
