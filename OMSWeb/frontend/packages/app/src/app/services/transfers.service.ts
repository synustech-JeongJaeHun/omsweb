import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ITransferHCACK, Transfer } from '@oms/models/transfer.model'
import {MTL} from "@oms/models/mtl.model";

@Injectable({
	providedIn: 'root',
})
export class TransfersService {
    private baseUrl = '/api/transfers'

	constructor(private http: HttpClient) {}

    checkTransfer(category: string, vehicleId: string, source: string, srctype: string, dest: string, dsttype: string, carrierId: string): Observable<ITransferHCACK> {
        return this.http.get<ITransferHCACK>(`${this.baseUrl}/transfercheck/${category}&${vehicleId}&${source}&${srctype}&${dest}&${dsttype}&${carrierId}`)
    }

    checkUpdate(commandId: string, dest: string): Observable<ITransferHCACK> {
        return this.http.get<ITransferHCACK>(`${this.baseUrl}/updatecheck/${commandId}&${dest}`)
    }

    checkCarrierChange(rcmd: string, carrierLoc: string, loctype: string, carrierId: string, newCarrierId: string): Observable<ITransferHCACK> {
        return this.http.get<ITransferHCACK>(`${this.baseUrl}/carriercheck/${rcmd}&${carrierLoc}&${loctype}&${carrierId}&${newCarrierId}`)
    }

    getTransferById(id: number) {
        return this.http.get<Transfer>(`${this.baseUrl}/${id}`)
    }

    checkTargetMTL(id: string): Observable<ITransferHCACK> {
      return this.http.get<ITransferHCACK>(`${this.baseUrl}/checkMtl/${id}`)
    }
    checkMTLOrder(commandId: string, dest: string): Observable<boolean> {
      return this.http.get<boolean>(`${this.baseUrl}/checkMTLOrder/${commandId}&${dest}`)
  }
}
