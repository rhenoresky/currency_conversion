interface CurrencyModel {
    lovLabel: string;
    country: string;
    code: string;
    name: string;
    symbol: string;
    rate: number;
    value: number;
}

interface ResultConversionModel {
    beforeConversion: string;
    resultConversion: string;
    rateCurrencyFirst: string;
    rateCurrencySecond: string;
}

export { CurrencyModel, ResultConversionModel };
