import { TestBed } from '@angular/core/testing';

import { AlfrescoBlockchainService } from './alfresco-blockchain.service';

describe('AlfrescoBlockchainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlfrescoBlockchainService = TestBed.get(AlfrescoBlockchainService);
    expect(service).toBeTruthy();
  });
});
