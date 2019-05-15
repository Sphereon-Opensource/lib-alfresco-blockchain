/*
import { NotificationService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { BlockchainProofService } from './blockchain-proof/blockchain-proof.service';
import { BLOCKCHAIN_REGISTER, BLOCKCHAIN_VERIFY, BlockchainSignAction, BlockchainVerifyAction } from './blockchain.actions';

export interface AppStore {
  app: any;
}

@Injectable()
export class BlockchainEffects {
  constructor(private store: Store<AppStore>,
              private actions$: Actions,
              private blockchainProofService: BlockchainProofService,
              private notification: NotificationService) {
    // this.snackBarConfig = new MatSnackBarConfig();
    // this.snackBarConfig.duration = 15000;
    // this.snackBarConfig.panelClass = 'snackbarBlockchain';
    // this.snackBarConfig.politeness = 'assertive';
  }

  // private snackBarConfig: MatSnackBarConfig;

  @Effect({ dispatch: false })
  blockchainSignNodes$ = this.actions$.pipe(
    ofType<BlockchainSignAction>(BLOCKCHAIN_REGISTER),
    map(action => {
      if (action.payload && action.payload.length > 0) {
        this.signNodes(action);
      } else {
        // TODO: Multiple items?
        // this.store
        //   .select(appSelection)
        //   .pipe(take(1))
        //   .subscribe(selection => {
        //     if (selection && !selection.isEmpty) {
        //       this.signNodes(selection);
        //     }
        //   });
      }
    })
  );

  @Effect({ dispatch: false })
  blockchainVerifyNodes$ = this.actions$.pipe(
    ofType<BlockchainVerifyAction>(BLOCKCHAIN_VERIFY),
    map(action => {
      if (action.payload && action.payload.length > 0) {
        this.verifyNodes(action.payload);
      } else {
        // TODO: Multiple items?
        // this.store
        //   .select(appSelection)
        //   .pipe(take(1))
        //   .subscribe(selection => {
        //     if (selection && !selection.isEmpty) {
        //       this.verifyNodes(selection);
        //     }
        //   });
      }
    })
  );

  private signNodes(selection) {
    const messageBuilder = [];
    this.blockchainProofService.registerSelection(selection.nodes).asObservable()
      .subscribe(
        (message) => {
          if (message != null) {
            messageBuilder.push(message);
            messageBuilder.push('\n');
          }
        },
        (error) => {
          this.toastMessage(error.message);
        }, () => {
          this.toastMessage(messageBuilder.join(''));
        }
      );
  }

  private verifyNodes(selection) {
    const messageBuilder = [];
    this.blockchainProofService.verifySelection(selection.nodes).asObservable()
      .subscribe(
        (message) => {
          if (message != null) {
            messageBuilder.push(message);
            messageBuilder.push('\n');
          }
        },
        (error) => {
          this.toastMessage(error.message);
        }, () => {
          this.toastMessage(messageBuilder.join(''));
        }
      );
  }

  private toastMessage(message: any) {
    // this.notification.openSnackMessageAction(message, '', this.snackBarConfig);
    this.notification.openSnackMessageAction(message, '');
  }
}
*/
