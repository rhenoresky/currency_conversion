import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '@core/service/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CurrencyConversionService {
    constructor(
        private apiService: ApiService,
        private httpClient: HttpClient
    ) {}

    getCurrencies() {
        return this.apiService.get(
            'https://restcountries.com/v3.1/all?fields=currencies&fields=name'
        );
    }

    getRates(): Observable<any> {
        return this.httpClient.get<any>(
            `https://open.er-api.com/v6/latest/USD`,
            {
                observe: 'response',
            }
        );
    }

    setLocalStorageCurrency(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
