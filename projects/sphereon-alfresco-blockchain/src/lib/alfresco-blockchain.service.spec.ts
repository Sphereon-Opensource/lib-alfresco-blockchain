import { async, TestBed } from '@angular/core/testing';

import { AlfrescoBlockchainService } from './alfresco-blockchain.service';

describe('AlfrescoBlockchainService', () => {
    // let nodesApiService: NodesApiService;
    let service: AlfrescoBlockchainService;

    beforeEach(() => {
        // nodesApiService = jasmine.createSpyObj('NodesApiService', [
        //     'updateNode'
        // ]);

        TestBed.configureTestingModule({
            providers: [
                AlfrescoBlockchainService,
                // { provide: NodesApiService, useValue: nodesApiService }
            ]
        });
        service = TestBed.get(AlfrescoBlockchainService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should verify entry', () => {
        expect(service.registerSelection([])).toBeDefined();
    });

    it('should verify multiple entries', () => {
        expect(service.registerSelection([])).toBeDefined();
    });

    it('should return error for non-entry or empty nodes', async(() => {

        // this.nodesApiService

        // (done: DoneFn) => {
        //     service.getObservableValue().subscribe(value => {
        //         expect(value).toBe('observable value');
        //         done();
        //     });

        //         expect(masterService.getValue()).toBe('fake value');


        // getQuoteSpy = twainService.getQuote.and.returnValue( of(testQuote) );


        service.registerSelection([{}])
            .subscribe(
                () => {
                    fail('Expected error');
                },
                error => {
                    expect(error).toBe('Selected entities should only contain entries.');
                });
    }));
});
