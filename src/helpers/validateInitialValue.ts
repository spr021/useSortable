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
export const validateInitialValue = <T>(initialValue: any): Array<T> => {
  if (
    typeof initialValue === 'object' &&
    initialValue !== null &&
    !Array.isArray(initialValue)
  ) {
    console.warn(
      'you have passed an object when an array is required. It still may work however. Please pass an array.',
    );
    initialValue = [...initialValue];
  }
  if (!Array.isArray(initialValue)) {
    console.warn(
      'you really want to break the validation. Please pass an array as parameter. Defaulting to [].',
    );
    initialValue = [];
  }

  return initialValue as Array<T>;
};
