import { Component, OnInit } from '@angular/core';
import { AlfrescoBlockchainService } from '../../projects/alfresco-blockchain/src/lib/alfresco-blockchain.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'lib-alfresco-blockchain';

  constructor(private blockchainService: AlfrescoBlockchainService) {
  }

  ngOnInit(): void {
    this.title = this.blockchainService.foo();
  }
}
