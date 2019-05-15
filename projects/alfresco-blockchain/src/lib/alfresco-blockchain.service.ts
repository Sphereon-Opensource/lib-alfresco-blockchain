import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlfrescoBlockchainService {
  public registerSelection(arg: any): Subject<string> {
    const subj = new Subject<string>();
    setTimeout(() => subj.next('Register'), 1000);
    setTimeout(() => subj.next('Foo'), 1250);
    setTimeout(() => subj.complete(), 1500);
    return subj;
  }

  public verifySelection(arg: any): Subject<string> {
    const subj = new Subject<string>();
    subj.next('Verify');
    subj.next('Bar');
    return subj;
  }
}
