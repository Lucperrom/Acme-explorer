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
      selectedPeriod: ['', Validators.required],
    });

    this.explorerQueryForm = this.fb.group({
      queryPeriod: ['', Validators.required],
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


  getAmountSpent(): void {
    if (this.spendingForm.invalid) {
      this.messageService.notifyMessage('You must indicate an explorer id and a period of time', 'alert-danger');
      return; 
    }

    const { selectedExplorer, selectedPeriod } = this.spendingForm.value;
    this.amountResult = this.cubeService.getMoneyByExplorerAndPeriod(selectedExplorer, selectedPeriod);
  }

  getExplorersByCondition(): void {
    if (this.explorerQueryForm.invalid) {
      this.messageService.notifyMessage('You must indicate a period of time, operator, and a sum of money', 'alert-danger');
      return; 
    }
    const { queryPeriod, queryOperator, queryValue } = this.explorerQueryForm.value;
    console.log("query period" + queryPeriod);
    console.log("query operator" + queryOperator);
    console.log("query value" + queryValue);

    this.explorerResults = this.cubeService.getExplorersByCondition(queryPeriod, queryOperator, queryValue);
  }
}
