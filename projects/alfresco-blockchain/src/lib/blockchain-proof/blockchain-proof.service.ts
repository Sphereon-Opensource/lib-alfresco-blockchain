import {Injectable} from '@angular/core';
import {NodesApiService, NotificationService, TranslationService} from '@alfresco/adf-core';
import {BlockchainService, Configuration, VerifyContentResponse} from './api';
import {MinimalNodeEntity, MinimalNodeEntryEntity} from 'alfresco-js-api';
import {HttpClient} from '@angular/common/http';
import * as models from './api/model/models';
import {Subject} from 'rxjs';
import {sprintf} from 'sprintf-js';
import {DatePipe} from '@angular/common';

@Injectable()
export class BlockchainProofService {

  private TIME_FORMAT = 'MMM d, y HH:mm:ss';

  private blockchainService: BlockchainService;

  constructor(private nodesApiService: NodesApiService,
              private notification: NotificationService,
              private translation: TranslationService,
              private http: HttpClient,
              private datePipe: DatePipe) {

    this.nodesApiService = nodesApiService;
    this.blockchainService = new BlockchainService(http, null, this.apiConfig());
  }


  registerSelection(contentEntities: Array<MinimalNodeEntity>): Subject<string> {
    const subject: Subject<string> = new Subject<string>();

    if (!this.isEntryEntitiesArray(contentEntities)) {
      subject.error(new Error(JSON.stringify({error: {statusCode: 400}})));
    } else {
      const atomicItemCounter: AtomicItemCounter = new AtomicItemCounter();
      contentEntities.forEach(entity => {
        if (entity.entry.isFile) {
          atomicItemCounter.incrementCount();
          this.registerEntry(entity, atomicItemCounter, subject);
        }
      });
    }

    return subject;
  }


  private registerEntry(entity, atomicItemCounter: AtomicItemCounter, subject: Subject<string>) {

    if ('Registered' === entity.entry.properties['bc:RegistrationState']) {
      const messageBuilder = [];
      messageBuilder.push('File ', entity.entry.name, ' is already registered, skipping.');
      const message = messageBuilder.join('');
      console.log(message);
      subject.next(message);
      return;
    }

    console.log('Marking entry for blockchain registration' + entity.entry.id);
    const nodeBody = {
      properties: {
        'bc:RegistrationState': 'ToDo',
        'bc:StateIcon': 'assets/images/pending-42x42.png'
      }
    };
    this.nodesApiService.updateNode(entity.entry.id, nodeBody).subscribe(value => {
      const messageBuilder = [];
      messageBuilder.push(sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTRATION_STARTED'), entity.entry.name));
      messageBuilder.push('.');
      const message = messageBuilder.join('');
      console.log(message);
      subject.next(message);
      atomicItemCounter.incrementIndex();
      if (atomicItemCounter.isLast()) {
        subject.complete();
      }
    }, error => {
      const userMessage = sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.PROCESS_FAILED'),
        this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTRATION'), entity.entry.name);
      this.handleApiError(error, userMessage, subject);
    });
  }


  verifySelection(contentEntities: Array<MinimalNodeEntity>): Subject<string> {
    const subject: Subject<string> = new Subject<string>();

    if (!this.isEntryEntitiesArray(contentEntities)) {
      subject.error(new Error(JSON.stringify({error: {statusCode: 400}})));
    } else {
      const fileEntries: Array<MinimalNodeEntryEntity> = [];
      contentEntities.forEach(entity => {
        if (entity.entry.isFile) {
          fileEntries.push(entity.entry);
        }
      });
      this.verifyEntry(fileEntries, subject);
    }
    return subject;
  }


  private verifyEntry(entries: Array<MinimalNodeEntryEntity>, subject: Subject<string>) {
    console.log('Verifying ' + entries.length + ' selected entries.');

    const request = {
      nodeIds: []
    };
    entries.forEach(entry => {
      request.nodeIds.push(entry.id);
    });

    this.blockchainService.verifyEntries(request).subscribe((verifyNodesResponse: models.VerifyNodesResponse) => {
      const messageBuilder = [];
      verifyNodesResponse.contentResponses.forEach(verifyContentResponse => {
        let matchedEntry: MinimalNodeEntryEntity = null;
        entries.forEach(entry => {
          if (entry.id === verifyContentResponse.requestId) {
            matchedEntry = entry;
          }
        });
        if (matchedEntry !== null) {
          const message = this.buildVerifyResponseMessage(matchedEntry, verifyContentResponse);
          messageBuilder.push(message);
          console.log(message);
          console.log('Calculated hash: ' + verifyContentResponse.hash);
          console.log('Calculated signature: ' + verifyContentResponse.hexSignature);
          if (verifyContentResponse.perHashProofChain != null) {
            console.log('Per hash proof chain id: ' + verifyContentResponse.perHashProofChain.chainId);
          }
          if (verifyContentResponse.singleProofChain != null) {
            console.log('Single proof chain id: ' + verifyContentResponse.singleProofChain.chainId);
          }
        }
      });

      const finalMessage = messageBuilder.join('');
      subject.next(finalMessage.substring(0, finalMessage.length - 1));
      subject.complete();
    }, error => {
      const userMessage = sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.PROCESS_FAILED'),
        this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.VERIFICATION'), error.error.message);
      this.handleApiError(error, userMessage, subject);
    });
  }

  private buildVerifyResponseMessage(entry, verifyContentResponse: VerifyContentResponse) {
    const messageBuilder = [];

    let registrationState = null;
    let registrationTime = null;
    if (verifyContentResponse.perHashProofChain != null) {
      registrationState = verifyContentResponse.perHashProofChain.registrationState;
      if (registrationState === 'REGISTERED') {
        registrationTime = this.datePipe.transform(verifyContentResponse.perHashProofChain.registrationTime, this.TIME_FORMAT);
      }
    }
    if (registrationTime == null && verifyContentResponse.singleProofChain != null) {
      registrationState = verifyContentResponse.singleProofChain.registrationState;
      if (registrationState === 'REGISTERED') {
        registrationTime = this.datePipe.transform(verifyContentResponse.singleProofChain.registrationTime, this.TIME_FORMAT);
      }
    }

    if (registrationState === 'REGISTERED') {
      messageBuilder.push(sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.FILE_WAS'), entry.name));
      messageBuilder.push(' ');
      if (registrationTime != null) {
        messageBuilder.push(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTERED_ON'));
        messageBuilder.push(' ');
        messageBuilder.push(registrationTime);
      } else {
        messageBuilder.push(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.REGISTERED'));
      }
    } else if (registrationState === 'PENDING') {
      messageBuilder.push(sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.FILE_IS'), entry.name));
      messageBuilder.push(' ');
      messageBuilder.push(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.PENDING'));
    } else {
      messageBuilder.push(sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.FILE_IS'), entry.name));
      messageBuilder.push(' ');
      messageBuilder.push(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.NOT_REGISTERED'));
    }
    messageBuilder.push('.\n');
    const message = messageBuilder.join('');
    return message;
  }


  offblocksSendSelection(contentEntities: Array<MinimalNodeEntity>): Subject<string> {
    const subject: Subject<string> = new Subject<string>();
    const dummySubject: Subject<string> = new Subject<string>();

    if (!this.isEntryEntitiesArray(contentEntities)) {
      subject.error(new Error(JSON.stringify({error: {statusCode: 400}})));
    } else {
      const fileEntries: Array<MinimalNodeEntryEntity> = [];
      contentEntities.forEach(entity => {
        const atomicItemCounter: AtomicItemCounter = new AtomicItemCounter();
        if (entity.entry.isFile) {
          fileEntries.push(entity.entry);
          atomicItemCounter.incrementCount();
          this.registerEntry(entity, atomicItemCounter, dummySubject);
        }
      });
      this.offblocksSendEntry(fileEntries, subject);
    }
    return subject;
  }


  private offblocksSendEntry(entries: Array<MinimalNodeEntryEntity>, subject: Subject<string>) {
    console.log('Sending ' + entries.length + ' selected entries to Offblocks.');

    const request = {
      nodeIds: []
    };
    entries.forEach(entry => {
      request.nodeIds.push(entry.id);
    });

    this.blockchainService.sendEntriesToOffblocks(request).subscribe((sendNodesToOffblocksResponse: models.SendNodesToOffblocksResponse) => {
      const messageBuilder = [];
      sendNodesToOffblocksResponse.contentResponses.forEach(fileDTO => {
        const message = 'File ' + fileDTO.fileName + ' was sent to for signing.';
        messageBuilder.push(message);
        console.log(message);
      });

      const finalMessage = messageBuilder.join('');
      subject.next(finalMessage.substring(0, finalMessage.length - 1));
      subject.complete();
    }, error => {
      const userMessage = sprintf(this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.PROCESS_FAILED'),
        this.translate('APP.MESSAGES.INFO.BLOCKCHAIN.SEND_TO_OFFBLOCKS'), error.error.message);
      this.handleApiError(error, userMessage, subject);
    });
  }

  private translate(key: string) {
    return this.translation.instant(key);
  }

  private handleApiError(error, userMessage, subject: Subject<string>) {
    const logMessageBuilder = [];
    logMessageBuilder.push(error.message);
    if (error.error && error.error.errors) {
      error.error.errors.forEach(errorItem => {
        const errorMessage = JSON.stringify(errorItem);
        console.log(errorMessage);
        if (logMessageBuilder.length > 0) {
          logMessageBuilder.push('\n');
        }
        logMessageBuilder.push(errorMessage);
      });
    }
    console.log(logMessageBuilder.join(''));

    subject.error(new Error(userMessage));
  }

  apiConfig() {
    const config = new Configuration();
    config.basePath = 'https://triall.dev.sphereon.com/agent';
    return config;
  }

  isEntryEntitiesArray(contentEntities: any[]): boolean {
    if (contentEntities && contentEntities.length) {
      const nonEntryNode = contentEntities.find(node => (!node || !node.entry || !(node.entry.nodeId || node.entry.id)));
      return !nonEntryNode;
    }
    return false;
  }

}

class AtomicItemCounter {

  private count = 0;
  private index = 0;

  incrementCount() {
    this.count++;
  }

  incrementIndex() {
    this.index++;
  }

  isLast(): boolean {
    return this.index >= this.count;
  }
}
