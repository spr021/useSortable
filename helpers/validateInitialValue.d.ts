/**
 * The validator function returns
 * - input array for array or object that can be change to a array
 * - [] for other
 *
 * @param {any} initialValue
 *              Value to be validated
 *
 * @return {Array}
 *         input array or [] for wrong input
 *
 * @example
 *        const validatedInitialValue = validateInitialValue(initialValue);
 */
export declare const validateInitialValue: (initialValue: any) => Array<any>;
