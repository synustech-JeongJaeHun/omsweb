import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TrackStatusService } from '@oms/root/services/track-status.service';
import { VehicleService } from '@oms/root/services/vehicle.service';
import { Dto } from '@oms/root/models/dto/track.model';
import {
  IVehicleDioCategory,
  IVehicleDioHistory,
} from '@oms/root/models/vehicle-status.model';

@Component({
  selector: 'oms-vehicle-status-dialog',
  templateUrl: './vehicle-status-dialog.component.html',
  styleUrls: ['./vehicle-status-dialog.component.scss'],
})
export class VehicleStatusDialogComponent implements OnInit, OnDestroy {
  visiblePIOTrend = false;

  vehicles: Dto.IVehicle[];
  currentVehicle: Dto.IVehicle | any;

  categories: {
    name: string;
    dis: { label: string; index: number }[];
    dos: { label: string; index: number }[];
    show: boolean;
  }[] = [];
  dioInfos: IVehicleDioCategory[] = [];
  dis: ('0' | '1')[] = [];
  dos: ('0' | '1')[] = [];
  pioIndice = [64, 65, 66, 67, 68, 69, 70, 71] as const;

  dioHistoriesIn30Seconds: {
    historyChangeTimeFrom30SecondsBefore: number;
    pi0: number;
    pi1: number;
    pi2: number;
    pi3: number;
    pi4: number;
    pi5: number;
    pi6: number;
    pi7: number;
    po0: number;
    po1: number;
    po2: number;
    po3: number;
    po4: number;
    po5: number;
    po6: number;
    po7: number;
    pattern: string;
  }[] = [];

  intervalId;

  valueFieldName(inout: 'pi' | 'po', index: number) {
    return `${inout}${index}`;
  }

  get parseInt() {
    return parseInt;
  }

  constructor(
    private dialogRef: MatDialogRef<VehicleStatusDialogComponent>,
    private trackStatusService: TrackStatusService,
    private vehicleService: VehicleService,
    private t$: TranslateService
  ) {}

  ngOnInit(): void {
    this.vehicleService.getVehicleDioCategories().subscribe((dios) => {
      this.dioInfos = dios;

      const diCategoryMap = new Map<
        string,
        { label: string; index: number }[]
      >();
      const doCategoryMap = new Map<
        string,
        { label: string; index: number }[]
      >();
      const categorySet = new Set<string>();
      dios.forEach((dio) => {
        {
          const values = diCategoryMap.get(dio.inCategory) ?? [];
          diCategoryMap.set(dio.inCategory, [
            ...values,
            { label: dio.inName, index: dio.id },
          ]);
        }
        {
          const values = doCategoryMap.get(dio.outCategory) ?? [];
          doCategoryMap.set(dio.outCategory, [
            ...values,
            { label: dio.outName, index: dio.id },
          ]);
        }
        {
          categorySet.add(dio.inCategory);
          categorySet.add(dio.outCategory);
        }
      });

      this.categories = [...categorySet.values()].map((category) => {
        return {
          name: category,
          show: true,
          dis: diCategoryMap.get(category) ?? [],
          dos: doCategoryMap.get(category) ?? [],
        };
      });
    });

    this.vehicles = JSON.parse(
      JSON.stringify(this.trackStatusService.trackData.vehicles)
    );

    if (this.vehicles.length > 0)
      this.onVehicleSelect({ value: this.vehicles[0] });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  onVehicleSelect({ value }) {
    if (value) {
      this.currentVehicle = value;
      if (this.intervalId) clearInterval(this.intervalId);

      const update = () => {
        this.vehicleService
          .getVehicleStatus(this.currentVehicle.id)
          .subscribe((res) => {
            Object.assign(this.currentVehicle, res);
          });
        this.vehicleService
          .getRecentVehicleDio(this.currentVehicle.id)
          .subscribe(
            (res) => {
              this.dis = (
                convertSignedIntegerToUnsigned(res.di1, 32)
                  .toString(2)
                  .padStart(32, '0') +
                convertSignedIntegerToUnsigned(res.di2, 32)
                  .toString(2)
                  .padStart(32, '0') +
                convertSignedIntegerToUnsigned(res.di3, 16)
                  .toString(2)
                  .padStart(16, '0')
              ).split('') as ('0' | '1')[];

              this.dos = (
                convertSignedIntegerToUnsigned(res.do1, 32)
                  .toString(2)
                  .padStart(32, '0') +
                convertSignedIntegerToUnsigned(res.do2, 32)
                  .toString(2)
                  .padStart(32, '0') +
                convertSignedIntegerToUnsigned(res.do3, 16)
                  .toString(2)
                  .padStart(16, '0')
              ).split('') as ('0' | '1')[];
            },
            (error) => {
              this.dis = Array(72).fill('0');
              this.dos = Array(72).fill('0');
            }
          );

        this.vehicleService
          .getVehicleDioHistories(
            this.currentVehicle.id,
            new Date(Date.now() - 30000),
            new Date()
          )
          .subscribe((res) => {
            // if no data, use last
            if (res.length === 0) {
              this.vehicleService
                .getRecentVehicleDio(this.currentVehicle.id)
                .subscribe((res) => {
                  const piBinary = convertSignedIntegerToUnsigned(res.di3, 16)
                    .toString(2)
                    .padStart(16, '0')
                    .split('')
                    .slice(0, 8) as ('0' | '1')[];

                  const poBinary = convertSignedIntegerToUnsigned(res.do3, 16)
                    .toString(2)
                    .padStart(16, '0')
                    .split('')
                    .slice(0, 8) as ('0' | '1')[];

                  // this!
                  this.dioHistoriesIn30Seconds = [
                    {
                      historyChangeTimeFrom30SecondsBefore: 0,
                      pi0: parseInt(piBinary[0]),
                      pi1: parseInt(piBinary[1]),
                      pi2: parseInt(piBinary[2]),
                      pi3: parseInt(piBinary[3]),
                      pi4: parseInt(piBinary[4]),
                      pi5: parseInt(piBinary[5]),
                      pi6: parseInt(piBinary[6]),
                      pi7: parseInt(piBinary[7]),
                      po0: parseInt(poBinary[0]),
                      po1: parseInt(poBinary[1]),
                      po2: parseInt(poBinary[2]),
                      po3: parseInt(poBinary[3]),
                      po4: parseInt(poBinary[4]),
                      po5: parseInt(poBinary[5]),
                      po6: parseInt(poBinary[6]),
                      po7: parseInt(poBinary[7]),
                      pattern: parsePIO(
                        parseInt(piBinary[0]),
                        parseInt(piBinary[1]),
                        parseInt(piBinary[2]),
                        parseInt(piBinary[3]),
                        parseInt(piBinary[4]),
                        parseInt(piBinary[5]),
                        parseInt(piBinary[6]),
                        parseInt(piBinary[7]),
                        parseInt(poBinary[0]),
                        parseInt(poBinary[1]),
                        parseInt(poBinary[2]),
                        parseInt(poBinary[3]),
                        parseInt(poBinary[4]),
                        parseInt(poBinary[5]),
                        parseInt(poBinary[6]),
                        parseInt(poBinary[7])
                      ),
                    },
                    {
                      historyChangeTimeFrom30SecondsBefore: 30,
                      pi0: parseInt(piBinary[0]),
                      pi1: parseInt(piBinary[1]),
                      pi2: parseInt(piBinary[2]),
                      pi3: parseInt(piBinary[3]),
                      pi4: parseInt(piBinary[4]),
                      pi5: parseInt(piBinary[5]),
                      pi6: parseInt(piBinary[6]),
                      pi7: parseInt(piBinary[7]),
                      po0: parseInt(poBinary[0]),
                      po1: parseInt(poBinary[1]),
                      po2: parseInt(poBinary[2]),
                      po3: parseInt(poBinary[3]),
                      po4: parseInt(poBinary[4]),
                      po5: parseInt(poBinary[5]),
                      po6: parseInt(poBinary[6]),
                      po7: parseInt(poBinary[7]),
                      pattern: '',
                    },
                  ];
                });
              return;
            }

            const data = res.map((moment) => {
              const piBinary = convertSignedIntegerToUnsigned(moment.di3, 16)
                .toString(2)
                .padStart(16, '0')
                .split('')
                .slice(0, 8) as ('0' | '1')[];

              const poBinary = convertSignedIntegerToUnsigned(moment.do3, 16)
                .toString(2)
                .padStart(16, '0')
                .split('')
                .slice(0, 8) as ('0' | '1')[];

              return {
                historyChangeTimeFrom30SecondsBefore:
                  (new Date(moment.historyChangeTime).getTime() -
                    (Date.now() - 30000)) /
                  1000,
                pi0: parseInt(piBinary[0]),
                pi1: parseInt(piBinary[1]),
                pi2: parseInt(piBinary[2]),
                pi3: parseInt(piBinary[3]),
                pi4: parseInt(piBinary[4]),
                pi5: parseInt(piBinary[5]),
                pi6: parseInt(piBinary[6]),
                pi7: parseInt(piBinary[7]),
                po0: parseInt(poBinary[0]),
                po1: parseInt(poBinary[1]),
                po2: parseInt(poBinary[2]),
                po3: parseInt(poBinary[3]),
                po4: parseInt(poBinary[4]),
                po5: parseInt(poBinary[5]),
                po6: parseInt(poBinary[6]),
                po7: parseInt(poBinary[7]),
                pattern: parsePIO(
                  parseInt(piBinary[0]),
                  parseInt(piBinary[1]),
                  parseInt(piBinary[2]),
                  parseInt(piBinary[3]),
                  parseInt(piBinary[4]),
                  parseInt(piBinary[5]),
                  parseInt(piBinary[6]),
                  parseInt(piBinary[7]),
                  parseInt(poBinary[0]),
                  parseInt(poBinary[1]),
                  parseInt(poBinary[2]),
                  parseInt(poBinary[3]),
                  parseInt(poBinary[4]),
                  parseInt(poBinary[5]),
                  parseInt(poBinary[6]),
                  parseInt(poBinary[7])
                ),
              };
            });

            const startCorrection = data[0];
            const endCorrection = data[data.length - 1];

            this.dioHistoriesIn30Seconds = [
              {
                ...startCorrection,
                historyChangeTimeFrom30SecondsBefore: 0,
                pattern: '',
              },
              ...data,
              {
                ...endCorrection,
                historyChangeTimeFrom30SecondsBefore: 30,
                pattern: '',
              },
            ];
          });
      };

      update();
      this.intervalId = setInterval(() => {
        update();
      }, 500);
    }
  }

  onToggleVehicleStatusNPIOTrend(element) {
    this.visiblePIOTrend = !this.visiblePIOTrend;

    if (this.visiblePIOTrend) {
      //element.textContent = '<  Vehicle Status';
      element.textContent =
        '< ' + this.t$.translations[this.t$.currentLang].names.vehicleStatus;
      this.dialogRef.addPanelClass('pioTrend-modalbox');
      this.dialogRef.updateSize('930px', '800px');
    } else {
      //element.textContent = 'PIO Trend';
      element.textContent =
        this.t$.translations[this.t$.currentLang].names.pioTrend;
      this.dialogRef.removePanelClass('pioTrend-modalbox');
      this.dialogRef.updateSize('750px', '540px');
    }
  }
}

function parsePIO(
  pi0: number,
  pi1: number,
  pi2: number,
  pi3: number,
  pi4: number,
  pi5: number,
  pi6: number,
  pi7: number,
  po0: number,
  po1: number,
  po2: number,
  po3: number,
  po4: number,
  po5: number,
  po6: number,
  po7: number
) {
  const pattern =
    String(pi0) +
    String(pi1) +
    String(pi2) +
    String(pi3) +
    String(pi4) +
    String(pi5) +
    String(pi6) +
    String(pi7) +
    String(po0) +
    String(po1) +
    String(po2) +
    String(po3) +
    String(po4) +
    String(po5) +
    String(po6) +
    String(po7);

  switch (pattern) {
    case '0000011000000000':
      return 'Before Arrival';
    case '0000011001000000':
      return 'OHT Arrival';
    case '1001011011001100':
      return 'Transfer Start';
    case '0001011011001100':
      return 'Carrier Detection On';
    case '0001011011001100':
      return 'Carrier Detection Off';
    case '0001011011001000':
      return 'Transfer Complete';
    case '0000011000000000':
      return 'OHT Start';

    default:
      return '';
  }
}

function convertSignedIntegerToUnsigned(
  value: number,
  bitLength: number
): number {
  if (value >= 0) return value;
  else return -1 * value + 2 ** (bitLength - 1);
}
