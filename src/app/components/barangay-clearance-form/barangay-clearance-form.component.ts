import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { phMobileValidator } from '../../validators/ph-mobile.validator';

@Component({
  selector: 'app-barangay-clearance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './barangay-clearance-form.component.html',
  styleUrl: './barangay-clearance-form.component.css',
})
export class BarangayClearanceFormComponent implements OnInit, OnDestroy {
  clearanceForm!: FormGroup;
  purposeOptions: string[] = [
    'Employment Requirement',
    'Postal / National ID',
    'Bank / Loan Application',
    'Scholarship / School Requirement',
    'Others',
  ];

  formStatus: string = 'PENDING';
  statusMessage: string = 'Checking form status...';
  submittedData: Record<string, string> | null = null;

  private subscriptions = new Subscription();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.clearanceForm = this.fb.group({
      fullName: ['', Validators.required],
      birthdate: ['', Validators.required],
      address: ['', Validators.required],
      contactNumber: ['', [Validators.required, phMobileValidator()]],
      purpose: ['', Validators.required],
      otherPurpose: [{ value: '', disabled: true }],
    });

    this.setupPurposeValueChanges();
    this.setupStatusChanges();
    this.updateStatusBanner(this.clearanceForm.status);
  }

  private setupPurposeValueChanges(): void {
    const purposeControl = this.clearanceForm.get('purpose');
    const otherPurposeControl = this.clearanceForm.get('otherPurpose');

    if (!purposeControl || !otherPurposeControl) return;

    const purposeSub = purposeControl.valueChanges.subscribe((selectedValue: string) => {
      if (selectedValue === 'Others') {
        otherPurposeControl.enable();
        otherPurposeControl.setValidators([Validators.required]);
      } else {
        otherPurposeControl.clearValidators();
        otherPurposeControl.setValue('');
        otherPurposeControl.disable();
      }
      otherPurposeControl.updateValueAndValidity();
    });

    this.subscriptions.add(purposeSub);
  }

  private setupStatusChanges(): void {
    const statusSub = this.clearanceForm.statusChanges.subscribe((status: string) => {
      this.updateStatusBanner(status);
    });

    this.subscriptions.add(statusSub);
  }

  private updateStatusBanner(status: string): void {
    this.formStatus = status;

    if (status === 'VALID') {
      this.statusMessage = 'Form is VALID — ready to submit Barangay Clearance request.';
    } else if (status === 'INVALID') {
      this.statusMessage = 'Form is INVALID — please complete all required fields properly.';
    } else {
      this.statusMessage = `Form status: ${status}`;
    }
  }

  get f() {
    return this.clearanceForm.controls;
  }

  get resolvedPurpose(): string {
    const selected = this.f['purpose'].value;
    if (selected === 'Others') {
      return this.f['otherPurpose'].value?.trim() || 'Others (specify purpose)';
    }
    return selected || 'Not selected';
  }

  onSubmit(): void {
    if (this.clearanceForm.invalid) {
      this.clearanceForm.markAllAsTouched();
      this.updateStatusBanner(this.clearanceForm.status);
      return;
    }

    const raw = this.clearanceForm.getRawValue();
    this.submittedData = {
      fullName: raw.fullName,
      birthdate: raw.birthdate,
      address: raw.address,
      contactNumber: raw.contactNumber,
      purpose: raw.purpose === 'Others' ? raw.otherPurpose : raw.purpose,
    };
  }

  onReset(): void {
    this.clearanceForm.reset({
      fullName: '',
      birthdate: '',
      address: '',
      contactNumber: '',
      purpose: '',
      otherPurpose: '',
    });
    this.submittedData = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}