import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StoreOwner} from '../models/storeOwner';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocialloginService {
  url;
  constructor(private http: HttpClient) { }


  public savesResponse(responce): Observable<StoreOwner> {
    this.url = 'http://localhost:3000/Login/Savesresponse';
    return this.http.post<StoreOwner>(this.url, responce);
  }
}
