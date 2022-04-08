import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TrackStatusService } from '@oms/root/services/track-status.service';
import { VehicleService } from '@oms/root/services/vehicle.service';
import { Dto } from '@oms/root/models/dto/track.model';
import { IVehicleDioCategory } from '@oms/root/models/vehicle-status.model';

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
    po_valid: number;
    po_cs_0: number;
    po_cs_1: number;
    po_tr_req: number;
    po_busy: number;
    po_compt: number;
    po_cont: number;
    pi_l_req: number;
    pi_u_req: number;
    pi_ready: number;
    pi_ho_avbl: number;
    pi_es: number;
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
        if (dio?.inCategory?.length > 0) {
          const values = diCategoryMap.get(dio.inCategory) ?? [];
          diCategoryMap.set(dio.inCategory, [
            ...values,
            { label: dio.inName, index: dio.id },
          ]);
          categorySet.add(dio.inCategory);
        }
        if (dio?.outCategory?.length > 0) {
          const values = doCategoryMap.get(dio.outCategory) ?? [];
          doCategoryMap.set(dio.outCategory, [
            ...values,
            { label: dio.outName, index: dio.id },
          ]);
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
                convertSignedIntegerToBitString(res.di1, 32) +
                convertSignedIntegerToBitString(res.di2, 32) +
                convertSignedIntegerToBitString(res.di3, 32)
              ).split('') as ('0' | '1')[];

              this.dos = (
                convertSignedIntegerToBitString(res.do1, 32) +
                convertSignedIntegerToBitString(res.do2, 32) +
                convertSignedIntegerToBitString(res.do3, 32)
              ).split('') as ('0' | '1')[];
            },
            (error) => {
              this.dis = Array(96).fill('0');
              this.dos = Array(96).fill('0');
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
                  const di3Binary = convertSignedIntegerToBitString(
                    res.di3,
                    32
                  ).split('') as ('0' | '1')[];

                  const do3Binary = convertSignedIntegerToBitString(
                    res.do3,
                    32
                  ).split('') as ('0' | '1')[];

                  // this!
                  this.dioHistoriesIn30Seconds = [
                    {
                      historyChangeTimeFrom30SecondsBefore: 0,
                      po_valid: parseInt(do3Binary[8]),
                      po_cs_0: parseInt(do3Binary[9]),
                      po_cs_1: parseInt(do3Binary[10]),
                      po_tr_req: parseInt(do3Binary[12]),
                      po_busy: parseInt(do3Binary[13]),
                      po_compt: parseInt(do3Binary[14]),
                      po_cont: parseInt(do3Binary[16]),
                      pi_l_req: parseInt(di3Binary[0]),
                      pi_u_req: parseInt(di3Binary[1]),
                      pi_ready: parseInt(di3Binary[3]),
                      pi_ho_avbl: parseInt(di3Binary[6]),
                      pi_es: parseInt(di3Binary[7]),
                      pattern: parsePIO(
                        {
                          L_REQ: di3Binary[0],
                          U_REQ: di3Binary[1],
                          READY: di3Binary[3],
                          HO_AVBL: di3Binary[6],
                          ES: di3Binary[7],
                        },
                        {
                          VALID: do3Binary[8],
                          CS_0: do3Binary[9],
                          CS_1: do3Binary[10],
                          TR_REQ: do3Binary[12],
                          BUSY: do3Binary[13],
                          COMPT: do3Binary[14],
                        }
                      ),
                    },
                    {
                      historyChangeTimeFrom30SecondsBefore: 30,
                      po_valid: parseInt(do3Binary[8]),
                      po_cs_0: parseInt(do3Binary[9]),
                      po_cs_1: parseInt(do3Binary[10]),
                      po_tr_req: parseInt(do3Binary[12]),
                      po_busy: parseInt(do3Binary[13]),
                      po_compt: parseInt(do3Binary[14]),
                      po_cont: parseInt(do3Binary[16]),
                      pi_l_req: parseInt(di3Binary[0]),
                      pi_u_req: parseInt(di3Binary[1]),
                      pi_ready: parseInt(di3Binary[3]),
                      pi_ho_avbl: parseInt(di3Binary[6]),
                      pi_es: parseInt(di3Binary[7]),
                      pattern: '',
                    },
                  ];
                });
              return;
            }

            // if histories exists

            const data = res.map((moment) => {
              const di3Binary = convertSignedIntegerToBitString(
                moment.di3,
                32
              ).split('') as ('0' | '1')[];

              const do3Binary = convertSignedIntegerToBitString(
                moment.do3,
                32
              ).split('') as ('0' | '1')[];

              return {
                historyChangeTimeFrom30SecondsBefore:
                  (new Date(moment.historyChangeTime).getTime() -
                    (Date.now() - 30000)) /
                  1000,
                po_valid: parseInt(do3Binary[8]),
                po_cs_0: parseInt(do3Binary[9]),
                po_cs_1: parseInt(do3Binary[10]),
                po_tr_req: parseInt(do3Binary[12]),
                po_busy: parseInt(do3Binary[13]),
                po_compt: parseInt(do3Binary[14]),
                po_cont: parseInt(do3Binary[16]),
                pi_l_req: parseInt(di3Binary[0]),
                pi_u_req: parseInt(di3Binary[1]),
                pi_ready: parseInt(di3Binary[3]),
                pi_ho_avbl: parseInt(di3Binary[6]),
                pi_es: parseInt(di3Binary[7]),
                pattern: parsePIO(
                  {
                    L_REQ: di3Binary[0],
                    U_REQ: di3Binary[1],
                    READY: di3Binary[3],
                    HO_AVBL: di3Binary[6],
                    ES: di3Binary[7],
                  },
                  {
                    VALID: do3Binary[8],
                    CS_0: do3Binary[9],
                    CS_1: do3Binary[10],
                    TR_REQ: do3Binary[12],
                    BUSY: do3Binary[13],
                    COMPT: do3Binary[14],
                  }
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
  pi: {
    L_REQ: '0' | '1';
    U_REQ: '0' | '1';
    READY: '0' | '1';
    HO_AVBL: '0' | '1';
    ES: '0' | '1';
  },
  po: {
    VALID: '0' | '1';
    CS_0: '0' | '1';
    CS_1: '0' | '1';
    TR_REQ: '0' | '1';
    BUSY: '0' | '1';
    COMPT: '0' | '1';
  }
) {
  const pattern =
    pi.L_REQ +
    pi.U_REQ +
    pi.READY +
    pi.HO_AVBL +
    pi.ES +
    po.VALID +
    po.CS_0 +
    po.CS_1 +
    po.TR_REQ +
    po.BUSY +
    po.COMPT;

  switch (pattern) {
    case '00011000000':
      return 'Before Arrival';
    case '00011010000':
      return 'OHT Arrival';
    case '10111110110':
      return 'Transfer Start - On';
    case '01111110110':
      return 'Transfer Start - Off';
    case '00111110110':
      return 'Carrier Detection';
    case '00111110100':
      return 'Transfer Complete';
    case '00011000000':
      return 'OHT Start';

    default:
      return '';
  }
}

/**
 * Parsing rule: right bit first, left bit last
 *
 * @param value
 * @param bitLength
 * @returns string
 */
function convertSignedIntegerToBitString(
  value: number,
  bitLength: number
): string {
  const absoluteValue = Math.abs(value);

  const data = [...Array(bitLength).keys()].map((index) => {
    const bit = (absoluteValue >> index) & 1;
    return String(bit);
  });

  if (value < 0) data[data.length - 1] = '1';

  return data.join('');
}
