import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CubeService } from 'src/app/services/cube.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.css']
})
export class CubeComponent implements OnInit {
  spendingForm!: FormGroup;
  explorerQueryForm!: FormGroup;

  amountResult: number | null = null;
  explorerResults: string[] = [];
  isDarkMode = false;

  constructor(
    private fb: FormBuilder, 
    private cubeService: CubeService, 
    private messageService: MessageService
  ) {}

  ngOnInit(): void {

    this.spendingForm = this.fb.group({
      selectedExplorer: ['', Validators.required],
      selectedPeriod: ['',[Validators.required, Validators.pattern(/^(M(0[1-9]|[1-2][0-9]|3[0-6])|Y(0[1-3]))$/)]
      ]
    });
    

    this.explorerQueryForm = this.fb.group({
      queryPeriod: [
        '',
        [Validators.required, Validators.pattern(/^(M(0[1-9]|[1-2][0-9]|3[0-6])|Y(0[1-3]))$/)]
      ],
      queryOperator: ['', Validators.required],
      queryValue: [0, [Validators.required, Validators.min(1)]],
    });
    
    this.calculateCube();
  }

   private async calculateCube(): Promise<void> {
    try {
      await this.cubeService.calculateCube();  
      this.cubeService.printFullCube();        
    } catch (error) {
      this.messageService.notifyMessage('Error al calcular el cubo', 'alert-danger');
    }
    
  }

  get currencyCode(): string {
    const locale = localStorage.getItem('locale');
    return locale === 'es' ? 'EUR' : 'GBP';
  }


  getAmountSpent(): void {
    const periodControl = this.spendingForm.get('selectedPeriod');
    const explorerControl = this.spendingForm.get('selectedExplorer');

    if (this.spendingForm.invalid) {
      if (explorerControl?.invalid) {
        this.messageService.notifyMessage('You must select an explorer ID.', 'alert-danger');
      } else if (periodControl?.errors?.['pattern']) {
        this.messageService.notifyMessage('Invalid period format. Use M01–M36 or Y01–Y03.', 'alert-danger');
      } else {
        this.messageService.notifyMessage('You must indicate an explorer ID and a valid period.', 'alert-danger');
      }
  
      this.spendingForm.markAllAsTouched();
      return;
    }
  
    const selectedExplorer = explorerControl?.value;
    const selectedPeriod = periodControl?.value;
  
    this.amountResult = this.cubeService.getMoneyByExplorerAndPeriod(selectedExplorer, selectedPeriod);
  }
  

  getExplorersByCondition(): void {
    const periodControl = this.explorerQueryForm.get('queryPeriod');
    const operatorControl = this.explorerQueryForm.get('queryOperator');
    const valueControl = this.explorerQueryForm.get('queryValue');
  
    if (this.explorerQueryForm.invalid) {
      if (periodControl?.errors?.['required']) {
        this.messageService.notifyMessage('You must enter a period.', 'alert-danger');
      } else if (periodControl?.errors?.['pattern']) {
        this.messageService.notifyMessage('Invalid period format. Use M01–M36 or Y01–Y03.', 'alert-danger');
      } else if (operatorControl?.invalid) {
        this.messageService.notifyMessage('You must select a comparison operator.', 'alert-danger');
      } else if (valueControl?.errors?.['required']) {
        this.messageService.notifyMessage('You must enter an amount of money.', 'alert-danger');
      } else if (valueControl?.errors?.['min']) {
        this.messageService.notifyMessage('The minimum value allowed is 1.', 'alert-danger');
      } else {
        this.messageService.notifyMessage('You must complete all fields with valid values.', 'alert-danger');
      }
  
      this.explorerQueryForm.markAllAsTouched();
      return;
    }
  
    const { queryPeriod, queryOperator, queryValue } = this.explorerQueryForm.value;
    this.explorerResults = this.cubeService.getExplorersByCondition(queryPeriod, queryOperator, queryValue);
  }
  
}
