/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, LOCALE_ID, Pipe, PipeTransform, Type} from '@angular/core';

import {NumberFormatStyle, NumberFormatter} from '../facade/intl';
import {NumberWrapper, isBlank, isNumber, isPresent, isString} from '../facade/lang';

import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';

const _NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(\-(\d+))?)?$/;

function formatNumber(
    pipe: Type<any>, locale: string, value: number | string, style: NumberFormatStyle,
    digits: string, currency: string = null, currencyAsSymbol: boolean = false): string {
  if (isBlank(value)) return null;
  // Convert strings to numbers
  value = isString(value) && NumberWrapper.isNumeric(value) ? +value : value;
  if (!isNumber(value)) {
    throw new InvalidPipeArgumentError(pipe, value);
  }
  let minInt: number;
  let minFraction: number;
  let maxFraction: number;
  if (style !== NumberFormatStyle.Currency) {
    // rely on Intl default for currency
    minInt = 1;
    minFraction = 0;
    maxFraction = 3;
  }

  if (isPresent(digits)) {
    var parts = digits.match(_NUMBER_FORMAT_REGEXP);
    if (parts === null) {
      throw new Error(`${digits} is not a valid digit info for number pipes`);
    }
    if (isPresent(parts[1])) {  // min integer digits
      minInt = NumberWrapper.parseIntAutoRadix(parts[1]);
    }
    if (isPresent(parts[3])) {  // min fraction digits
      minFraction = NumberWrapper.parseIntAutoRadix(parts[3]);
    }
    if (isPresent(parts[5])) {  // max fraction digits
      maxFraction = NumberWrapper.parseIntAutoRadix(parts[5]);
    }
  }
  return NumberFormatter.format(value as number, locale, style, {
    minimumIntegerDigits: minInt,
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
    currency: currency,
    currencyAsSymbol: currencyAsSymbol
  });
}

/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers. For other browsers please use an
 * polyfill, for example: [https://github.com/andyearnshaw/Intl.js/].
 *
 * Formats a number as local text. i.e. group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * ### Usage
 *
 *     expression | number[:digitInfo]
 *
 * where `expression` is a number and `digitInfo` has the following format:
 *
 *     {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 *
 * - minIntegerDigits is the minimum number of integer digits to use. Defaults to 1.
 * - minFractionDigits is the minimum number of digits after fraction. Defaults to 0.
 * - maxFractionDigits is the maximum number of digits after fraction. Defaults to 3.
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='NumberPipe'}
 *
 * @stable
 */
@Pipe({name: 'number'})
export class DecimalPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digits: string = null): string {
    return formatNumber(DecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
  }
}

/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers. For other browsers please use an
 * polyfill, for example: [https://github.com/andyearnshaw/Intl.js/].
 *
 * Formats a number as local percent.
 *
 * ### Usage
 *
 *     expression | percent[:digitInfo]
 *
 * For more information about `digitInfo` see {@link DecimalPipe}
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='PercentPipe'}
 *
 * @stable
 */
@Pipe({name: 'percent'})
export class PercentPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(value: any, digits: string = null): string {
    return formatNumber(PercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
  }
}

/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers. For other browsers please use an
 * polyfill, for example: [https://github.com/andyearnshaw/Intl.js/].
 *
 *
 * Formats a number as local currency.
 *
 * ### Usage
 *
 *     expression | currency[:currencyCode[:symbolDisplay[:digitInfo]]]
 *
 * where `currencyCode` is the ISO 4217 currency code, such as "USD" for the US dollar and
 * "EUR" for the euro. `symbolDisplay` is a boolean indicating whether to use the currency
 * symbol (e.g. $) or the currency code (e.g. USD) in the output. The default for this value
 * is `false`.
 * For more information about `digitInfo` see {@link DecimalPipe}
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='CurrencyPipe'}
 *
 * @stable
 */
@Pipe({name: 'currency'})
export class CurrencyPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private _locale: string) {}

  transform(
      value: any, currencyCode: string = 'USD', symbolDisplay: boolean = false,
      digits: string = null): string {
    return formatNumber(
        CurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode,
        symbolDisplay);
  }
}
