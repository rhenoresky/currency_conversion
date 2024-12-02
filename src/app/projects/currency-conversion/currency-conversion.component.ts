import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TableComponent } from '@core/shared-component/table/table.component';
import { CurrencyConversionService } from './service/currency-conversion.service';
import { MessageBoxService } from '@core/service/message-box.service';
import { LovComponent } from '@core/shared-component/lov/lov.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyModel, ResultConversionModel } from './model/currency.model';

declare let particlesJS: any;

@Component({
    selector: 'app-currency-conversion',
    templateUrl: './currency-conversion.component.html',
    styleUrls: ['./currency-conversion.component.scss'],
    animations: [],
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
    dataCurrenciesForTable: CurrencyModel[] = [];
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
        this.invokeParticles();
    }

    invokeParticles(): void {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 160,
                    density: { enable: true, value_area: 800 },
                },
                color: { value: '#ffffff' },
                shape: {
                    type: 'circle',
                    stroke: { width: 0, color: '#000000' },
                    polygon: { nb_sides: 5 },
                    image: { src: 'img/github.svg', width: 100, height: 100 },
                },
                opacity: {
                    value: 1,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0,
                        sync: false,
                    },
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 4,
                        size_min: 0.3,
                        sync: false,
                    },
                },
                line_linked: {
                    enable: false,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: { enable: false, rotateX: 600, rotateY: 600 },
                },
            },
        });
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
            this.dataCurrenciesForTable = this.dataCurrencies;
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
        const dataCurrencyFirst = this.formConversion
            .get('currencyFirst')
            .getRawValue();
        const dataCurrencySecond = this.formConversion
            .get('currencySecond')
            .getRawValue();
        console.log(dataCurrencyFirst);
        console.log(dataCurrencySecond);
        this.formConversion.get('currencyFirst').patchValue(dataCurrencySecond);
        this.formConversion.get('currencySecond').patchValue(dataCurrencyFirst);
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
        this.dataCurrenciesForTable = this.dataCurrencies;

        const updatedDataCurrencies = this.dataCurrenciesForTable.map(
            (currency) => {
                currency.rate =
                    currency.rate / conversionData.currencyFirst.rate;
                currency.value = currency.rate * conversionData.amount;

                return currency;
            }
        );

        this.dataCurrenciesForTable = updatedDataCurrencies;
    }

    onSelectedCurrencyFirst(e): void {
        this.formConversion.get('currencyFirst').patchValue(e);
        console.log(e);
        if (this.formConversion.valid) {
            this.calculateCurrency();
        } else {
            this.formConversion.markAllAsTouched();
        }
    }

    onSelectedCurrencySecond(e): void {
        this.formConversion.get('currencySecond').patchValue(e);
        console.log(e);
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
                                        rate: res.body.rates[key],
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
                        this.dataCurrenciesForTable = result;
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
