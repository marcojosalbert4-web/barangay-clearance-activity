import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phMobileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value ?? '').toString().trim();

    if (!value) {
      return null; // Let Validators.required handle empty values
    }

    const phMobilePattern = /^09\d{9}$/;
    return phMobilePattern.test(value)
      ? null
      : { invalidPhMobile: 'Contact number must follow the 09XXXXXXXXX format.' };
  };
}