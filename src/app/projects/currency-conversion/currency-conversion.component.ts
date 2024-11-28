import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TableComponent } from '@core/shared-component/table/table.component';
import { CurrencyConversionService } from './service/currency-conversion.service';
import { MessageBoxService } from '@core/service/message-box.service';
import { LovComponent } from '@core/shared-component/lov/lov.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyModel, ResultConversionModel } from './model/currency.model';

@Component({
    selector: 'app-currency-conversion',
    templateUrl: './currency-conversion.component.html',
    styleUrls: ['./currency-conversion.component.scss'],
})
export class CurrencyConversionComponent {
    @ViewChild('TableComponent') table: TableComponent;
    @ViewChildren('LovComponent') lov: QueryList<LovComponent>;
    columnMap: { label: string; key: string }[] = [
        { label: 'Code', key: 'code' },
        { label: 'Country', key: 'country' },
        { label: 'Rate', key: 'rate' },
        { label: 'Value', key: 'value' },
    ];
    dataCurrencies: CurrencyModel[] = [];
    showResultConversion: boolean = false;
    showButtonConvert: boolean = true;
    resultConversionData: ResultConversionModel;
    formConversion: FormGroup;
    currencyFirstCode: string;
    currencySecondCode: string;

    constructor(
        private currencyService: CurrencyConversionService,
        private messageBoxService: MessageBoxService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.getLocalStorageCurrency();
        this.createFormConversion();
    }

    createFormConversion(): void {
        this.formConversion = this.formBuilder.group({
            amount: [0, Validators.required],
            currencyFirst: [undefined, Validators.required],
            currencySecond: [undefined, Validators.required],
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

    onInputNumber(e): void {
        if (this.formConversion.valid) {
            this.calculateCurrency();
        } else {
            this.formConversion.markAllAsTouched();
        }
    }

    swapCurrency(): void {
        const currencyFirst = this.formConversion
            .get('currencyFirst')
            .getRawValue();
        this.formConversion
            .get('currencyFirst')
            .patchValue(
                this.formConversion.get('currencySecond').getRawValue()
            );
        this.formConversion.get('currencySecond').patchValue(currencyFirst);
        if (this.formConversion.valid) {
            this.calculateCurrency();
        } else {
            this.formConversion.markAllAsTouched();
        }
    }

    onClickConvert(): void {
        if (this.formConversion.valid) {
            this.calculateCurrency();
            this.showResultConversion = true;
            this.showButtonConvert = false;
        } else {
            this.formConversion.markAllAsTouched();
            this.messageBoxService.showInfo('Form must be filled');
        }
    }

    calculateCurrency(): void {
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

    onSelectedCurrencyFirst(e): void {
        this.formConversion.get('currencyFirst').patchValue(e);
        if (this.formConversion.valid) {
            this.calculateCurrency();
        } else {
            this.formConversion.markAllAsTouched();
        }
    }

    onSelectedCurrencySecond(e): void {
        this.formConversion.get('currencySecond').patchValue(e);
        if (this.formConversion.valid) {
            this.calculateCurrency();
        } else {
            this.formConversion.markAllAsTouched();
        }
    }

    getCurrenciesFromApi(): void {
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
