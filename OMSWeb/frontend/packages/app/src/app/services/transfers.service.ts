import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ITransferHCACK } from '@oms/models/transfer.model'

@Injectable({
	providedIn: 'root',
})
export class TransfersService {
    private baseUrl = '/api/transfers'

	constructor(private http: HttpClient) {}

    checkTransfer(category: string, vehicleId: string, source: string, srctype: string, dest: string, dsttype: string, carrierId: string): Observable<ITransferHCACK> {
        return this.http.get<ITransferHCACK>(`${this.baseUrl}/transfercheck/${category}&${vehicleId}&${source}&${srctype}&${dest}&${dsttype}&${carrierId}`)
    }

}
