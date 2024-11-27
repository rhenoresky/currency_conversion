import {
    ChangeDetectorRef,
    Component,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { TableComponent } from '@core/shared-component/table/table.component';
import { CurrencyConversionService } from './service/currency-conversion.service';
import { MessageBoxService } from '@core/service/message-box.service';
import { LovComponent } from '@core/shared-component/lov/lov.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-currency-conversion',
    templateUrl: './currency-conversion.component.html',
    styleUrls: ['./currency-conversion.component.scss'],
})
export class CurrencyConversionComponent {
    @ViewChild('TableComponent') table: TableComponent;
    @ViewChildren('LovComponent') lov: QueryList<LovComponent>;
    columnMap = [
        { label: 'Code', key: 'code' },
        { label: 'Country', key: 'country' },
        { label: 'Rate', key: 'rate' },
        { label: 'Value', key: 'value' },
    ];
    dataCurrencies: any[] = [];
    showResultConversion: boolean = false;
    showButtonConvert: boolean = true;
    resultConversionData: any;
    formConversion: FormGroup;
    currencyFirstCode: string;
    currencySecondCode: string;

    constructor(
        private currencyService: CurrencyConversionService,
        private messageBoxService: MessageBoxService,
        private formBuilder: FormBuilder,
        private detectChange: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.getLocalStorageCurrency();
        this.createFormConversion();
    }

    createFormConversion() {
        this.formConversion = this.formBuilder.group({
            amount: [0, Validators.required],
            currencyFirst: [{}, Validators.required],
            currencySecond: [{}, Validators.required],
        });
    }

    getLocalStorageCurrency(): void {
        const item = localStorage.getItem('dataCurrencies');
        if (item) {
            this.dataCurrencies = JSON.parse(item);
        } else {
            this.getCurrenciesFromApi();
        }
    }

    onInputNumber(e) {
        this.calculateCurrency();
    }

    swapCurrency() {
        const currencyFirst = this.formConversion
            .get('currencyFirst')
            .getRawValue();
        this.formConversion
            .get('currencyFirst')
            .patchValue(
                this.formConversion.get('currencySecond').getRawValue()
            );
        this.formConversion.get('currencySecond').patchValue(currencyFirst);
        this.calculateCurrency();
    }

    onClickConvert() {
        this.calculateCurrency();
        this.showResultConversion = true;
        this.showButtonConvert = false;
    }

    calculateCurrency() {
        const conversionData = this.formConversion.getRawValue();
        const beforeConversion = `${conversionData.amount.toLocaleString('en', {
            minimumFractionDigits: 2,
        })} ${conversionData.currencyFirst.name} =`;
        const resultConversion = `${
            (conversionData.currencySecond.value /
                conversionData.currencyFirst.value) *
            conversionData.amount
        } ${conversionData.currencySecond.name}`;
        const rateCurrencyFirst = `1.00 ${
            conversionData.currencyFirst.code
        } = ${
            conversionData.currencySecond.value /
            conversionData.currencyFirst.value
        } ${conversionData.currencySecond.code}`;
        const rateCurrencySecond = `1.00 ${
            conversionData.currencySecond.code
        } = ${
            conversionData.currencyFirst.value /
            conversionData.currencySecond.value
        } ${conversionData.currencyFirst.code}`;
        this.resultConversionData = {
            beforeConversion,
            resultConversion,
            rateCurrencyFirst,
            rateCurrencySecond,
        };
    }

    onSelectedCurrencyFirst(e) {
        this.formConversion.get('currencyFirst').patchValue(e);
        this.calculateCurrency();
    }

    onSelectedCurrencySecond(e) {
        this.formConversion.get('currencySecond').patchValue(e);
        this.calculateCurrency();
    }

    getCurrenciesFromApi() {
        this.currencyService.getCurrencies().subscribe({
            next: (res) => {
                const result = [];
                res.map((currency: any) => {
                    const country = currency.name.common;
                    for (const key in currency.currencies) {
                        const element = currency.currencies[key];
                        const objectCurrency = {
                            lovLabel: `${key} - ${country}`,
                            country,
                            code: key,
                            ...element,
                        };
                        result.push(objectCurrency);
                    }
                });
                this.currencyService.getRates().subscribe({
                    next: (res) => {
                        for (const key in res.body.rates) {
                            for (let i = 0; i < result?.length; i++) {
                                if (result[i].code === key) {
                                    const {
                                        code,
                                        lovLabel,
                                        country,
                                        name,
                                        symbol,
                                    } = result[i];
                                    result[i] = {
                                        lovLabel,
                                        country,
                                        code,
                                        name,
                                        symbol,
                                        rate: Math.round(res.body.rates[key]),
                                        value: res.body.rates[key],
                                    };
                                }
                            }
                        }
                        this.currencyService.setLocalStorageCurrency(
                            'dataCurrencies',
                            result
                        );
                        this.dataCurrencies = result;
                        const tempArray = this.lov.toArray();
                        tempArray.forEach((temp) => {
                            temp.list = this.dataCurrencies;
                        });
                    },
                    error: (err) => {
                        this.messageBoxService.showError('Error get rates');
                    },
                });
            },
            error: (err) => {
                this.messageBoxService.showError('Error get currencies');
            },
        });
    }
}
