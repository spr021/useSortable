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
export const validateInitialValue = <T>(initialValue: unknown): ReadonlyArray<T> => {
  if (Array.isArray(initialValue)) return initialValue as T[];

  console.warn('useSortable expected an array. Defaulting to an empty array.');
  return [];
};
